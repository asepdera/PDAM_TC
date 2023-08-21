const mongoose = require("mongoose");
const MateriModel = require("../models/materi");
const TugasModel = require("../models/tugas");
const KelasModel = require("../models/kelas");
const uploadFile = require("../middleware/filepath");
const multer = require("multer");
const response = require("../respons/response");
const _ = require("lodash");

module.exports = {
  getAllMateri: async (req, res) => {
    try {
      let { page, limits, isPaginate } = req.query;
      const totalData = await MateriModel.countDocuments();

      if (isPaginate === 0) {
        const data = await MateriModel.find().populate(
          "instruktur items.tugas"
        );

        result = {
          data: data,
          "total data": totalData,
        };

        response(200, results, "get materi");
        return;
      }

      page = parseInt(page) || 1;
      limits = parseInt(limits) || 6;
      const data = await MateriModel.find()
        .populate("instruktur items.tugas")
        .skip((page - 1) * limits)
        .limit(limits);

      result = {
        data: data,
        "total data": totalData,
      };

      response(200, result, "Get all materi", res);
    } catch (error) {
      response(500, error, error.message, res);
    }
  },
  getOneMateri: async (req, res) => {
    try {
      const _id = req.params.id;
      const result = await MateriModel.findById(_id);

      if (!result) {
        response(404, _id, "Materi tidak di temukan", res);
      }

      response(200, result, "Materi di dapat", res);
    } catch (error) {
      response(500, error, "Server error", res);
    }
  },
  getBySlugMateri: async (req, res) => {
    const { slug } = req.params;

    try {
      const result = await MateriModel.findOne({ slug: slug }).populate(
        "instruktur items.tugas"
      );

      if (!result) {
        response(404, result, "Materi tidak di temukan", res);
      }

      response(200, result, "Materi di dapat", res);
    } catch (error) {
      response(500, error, error.message, res);
    }
  },
  createMateri: async (req, res) => {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      const { data } = req.body;

      let tugasList = [];
      let materi = [];

      JSON.parse(data).map((value, index) => {
        const { kodeMateri, section, description, items, instruktur } = value;
        const randomNumber = Math.floor(Math.random() * 100)
        const slug = _.kebabCase(section)+randomNumber
        let itemsList = [];

        items.map((item, idx) => {
          let attachmentFiles = [];
          const { title, description, attachment, tugas } = item;

          if (req.files) {
            req.files.map((file) => {
              const [context, related, parentCode] =
                file.originalname.split(" --- ");
              if (
                context === "Materi" &&
                title === related &&
                parentCode.split(".")[0] === kodeMateri
              ) {
                const [base, attachmentPath] = file.path.split("/api/");
                attachmentFiles.push(attachmentPath);
              }
            });
          }

          const newTugas = tugas.map((v, i) => {
            return {
              ...v,
              parent: {
                materi: title,
                section: section + " - " + kodeMateri,
              },
            };
          });

          tugasList.push(newTugas);

          itemsList.push({
            title: title,
            description: description,
            attachment: attachmentFiles,
            tugas: [],
          });
        });

        materi.push({
          kodeMateri: kodeMateri,
          section: section,
          description: description,
          slug: slug,
          items: itemsList,
          instruktur: instruktur,
        });
      });

      console.log(tugasList);

      const saveMateri = await MateriModel.insertMany(materi, { session });

      let tugasPopulate = [];

      if (tugasList.length > 0) {
        let idx = 0;
        for (const tugas of tugasList.filter((v) => v.length > 0)) {
          const [name, kode] = tugas[0].parent.section.split(" - ");
          const title = tugas[0].parent.materi;

          const checkParent = saveMateri.filter(
            (v) => v.section === name && v.kodeMateri === kode
          );
          if (checkParent.length === 0) {
            response(404, [], "Gagal dalam membuat tugas!", res);
            return;
          }

          let tugasAttachment = "";

          if (req.files) {
            req.files.map((file) => {
              const [context, related, parentCode] =
                file.originalname.split(" --- ");
              if (
                context === "Tugas" &&
                tugas[0].title === related &&
                parentCode.split(".")[0] === kode
              ) {
                console.log(kode);
                const [base, attachmentPath] = file.path.split("/PDAM_TC/");
                tugasAttachment = attachmentPath;
              }
            });
          }

          const entityTugas = new TugasModel({
            materi: checkParent._id,
            kelas: tugas[0].kelas,
            title: tugas[0].title,
            instruction: tugas[0].instruction,
            deadline: tugas[0].deadline,
            attachment: tugasAttachment,
          });

          const savedTugas = await entityTugas.save({ session });

          const getPrimaryMateri = checkParent[0];

          const getItemsMateri = getPrimaryMateri.items.filter(
            (v) => v.title === title
          );

          tugasPopulate = [...tugasPopulate, savedTugas._id];

          const newItemsMateri = getItemsMateri.map((val, idx) => {
            return {
              title: val.title,
              description: val.description,
              attachment: val.attachment,
              tugas: tugasPopulate,
            };
          });

          // const mergeItems = [...getPrimaryMateri.items,...newItemsMateri]

          await MateriModel.updateOne(
            { _id: getPrimaryMateri._id },
            { $set: { items: newItemsMateri } },
            { session }
          );
          idx += 1;
        }
      }
      await session.commitTransaction();
      session.endSession();

      response(201, materi, "Berhasil menambahkan materi!", res);
    } catch (error) {
      await session.abortTransaction();
      session.endSession();
      response(500, error, error.message, res);
    }
  },
  updateMateri: async (req, res) => {
    const idMaterial = req.params.id;
    const {data} = req.body
    
    const extractedData = JSON.parse(data)


    try {
      const materi = await MateriModel.findByIdAndUpdate(idMaterial, extractedData, {
        new: true,
      });
      response(200, materi, "Materi berhasil diubah", res);
    } catch (error) {
      response(500, error,error.message, res);
    }
  },
  deleteMateri: async (req, res) => {
    const idMaterial = req.params.id;

    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      const materi = await MateriModel.findByIdAndRemove(idMaterial, {
        session,
      });
      const tugas = await TugasModel.deleteMany(
        { materi: idMaterial },
        { session }
      );

      const kelas = await KelasModel.updateMany(
        { materi: idMaterial },
        { $pull: { materi: idMaterial } },
        { session }
      );

      await session.commitTransaction();
      response(200, materi, "Materi deleted", res);
    } catch (error) {
      response(500, error, error.message, res);
      await session.abortTransaction();
    } finally {
      session.endSession();
    }
  },

  getSubmateri: async (req, res) => {
    try {
      const { slug } = req.params;
      const result = await MateriModel.findOne({ slug });

      if (!result) {
        response(404, _id, "Materi tidak di temukan", res);
      }

      response(200, result.items, "Materi di dapat", res);
    } catch (error) {
      response(500, error, "Server error", res);
    }
  }
};
