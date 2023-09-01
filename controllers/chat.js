const response = require("../respons/response");

const Chat = require("../models/chat");
const ChatNotification = require("../models/chatNotification");
const Room = require("../models/room");
const user = require("../models/user");

module.exports = {
  index: async (req, res) => {
    try {
      const id = req.params.id;

      const isPaginate = parseInt(req.query.paginate);

      const room = await Room.findById(id);

      if (!room) {
        return response(400, null, "Data tidak ditemukan", res);
      }

      let valid = false;

      room.users.map((r) => {
        if (req.user.id == r) {
          valid = true;
        }
      });

      if (!valid && req.user.role !== 1) {
        return response(400, null, "Forbidden", res);
      }

      if (isNaN(isPaginate)) {
        const totalData = await Chat.find({
          room: id,
        }).countDocuments();

        const data = await Chat.find({
          room: id,
        }).populate("sender", "name");

        result = {
          data: data,
          "total data": totalData,
        };
        response(200, result, "get kategori berhasil", res);
        return;
      }

      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 10;
      const totalData = await Chat.find({
        room: id,
      }).countDocuments();

      const data = await Chat.find({
        room: id,
      })
        .skip((page - 1) * limit)
        .limit(limit)
        .populate("sender", "name");

      result = {
        data: data,
        "total data": totalData,
      };

      response(200, result, "Berhasil get all chat", res);
    } catch (error) {
      console.log(error);

      response(500, error, "Server error", res);
    }
  },

  notification: async (req, res) => {
    try {
      const isPaginate = parseInt(req.query.paginate);

      if (isNaN(isPaginate)) {
        const totalData = await ChatNotification.find({
          users: { $in: req.user.id },
        }).countDocuments();

        let data = await ChatNotification.find({
          users: { $in: req.user.id },
        })
          .populate("users", "name")
          .populate("chat", "sender chat read createdAt");

        data = await Chat.populate(data, {
          path: "chat.sender",
          select: "name",
        });

        result = {
          data,
          "total data": totalData,
        };

        return response(200, result, "Berhasil get all notif", res);
      }

      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 10;

      const totalData = await ChatNotification.find({
        users: { $in: req.user.id },
      }).countDocuments();

      let data = await ChatNotification.find({
        users: { $in: req.user.id },
      })
        .skip((page - 1) * limit)
        .limit(limit)
        .populate("users", "name")
        .populate("chat", "sender chat read createdAt");

      data = await Chat.populate(data, {
        path: "chat.sender",
        select: "name",
      });

      result = {
        data,
        "total data": totalData,
      };

      return response(200, result, "Berhasil get all notif", res);
    } catch (error) {
      console.log(error);

      return response(500, error, "Server error", res);
    }
  },

  read: async (req, res) => {
    try {
      const id = req.params.id;

      const chat = await Chat.findById(id);

      if (!chat) {
        return response(400, null, "Data tidak ditemukan", res);
      }

      const room = await Room.findById(chat.room);

      if (!room) {
        return response(400, null, "Data tidak ditemukan", res);
      }

      let valid = false;

      room.users.map((r) => {
        if (req.user.id == r) {
          valid = true;
        }
      });

      if (!valid && req.user.role !== 1) {
        return response(400, null, "Forbidden", res);
      }

      await Chat.findByIdAndUpdate(id, {
        read: true,
      });

      const result = await Chat.findById(id).populate("sender", "name");

      return response(200, result, "Chat berhasil di read", res);
    } catch (error) {
      console.log(error);

      return response(500, error, "Server error", res);
    }
  },

  readNotification: async (req, res) => {
    try {
      const id = req.params.id;

      const notif = await ChatNotification.findById(id);

      if (!notif) {
        return response(400, null, "Data tidak ditemukan", res);
      }

      let valid = false;

      notif.users.map((r) => {
        if (req.user.id == r) {
          valid = true;
        }
      });

      if (!valid && req.user.role !== 1) {
        return response(400, null, "Forbidden", res);
      }

      await ChatNotification.findByIdAndUpdate(id, {
        active: false,
      });

      let result = await ChatNotification.findById(id)
        .populate("users", "name")
        .populate("chat", "sender chat read createdAt");

      result = await Chat.populate(result, {
        path: "chat.sender",
        select: "name",
      });

      return response(200, result, "Notif berhasil di read", res);
    } catch (error) {
      console.log(error);

      return response(500, error, "Server error", res);
    }
  },

  store: async (req, res) => {
    try {
      const chat = req.body.chat;

      if (!chat) {
        return response(400, null, "Mohon isi chat", res);
      }

      const id = req.params.id;

      const room = await Room.findById(id);

      if (!room) {
        return response(400, null, "Data tidak ditemukan", res);
      }

      let valid = false;

      room.users.map((r) => {
        if (req.user.id == r) {
          valid = true;
        }
      });

      if (!valid && req.user.role !== 1) {
        return response(400, null, "Forbidden", res);
      }

      const newChat = await Chat.create({
        sender: req.user.id,
        room: id,
        chat,
      });

      const newNotif = await ChatNotification.create({
        chat: newChat._id,
        users: room.users,
      });

      let notification = await ChatNotification.findById(newNotif._id, {})
        .populate("users", "name")
        .populate("chat", "sender chat read createdAt");

      notification = await Chat.populate(notification, {
        path: "chat.sender",
        select: "name",
      });

      return response(200, { chat }, "Berhasil menambahkan chat", res);
    } catch (error) {
      console.log(error);

      return response(500, error, "Server error", res);
    }
  },

  storeIo: async ({ chat, room: roomId, sender }) => {
    try {
      if (!chat) {
        console.log("Mohon isi chat");
        return null;
      }

      const id = roomId;

      const room = await Room.findOne({ _id: id });

      if (!room) {
        console.log("Data tidak ditemukan");
        return null;
      }

      let valid = false;

      room.users.map((r) => {
        if (sender == r) {
          valid = true;
        }
      });

      const getSender = await user.findOne({ _id: sender });

      if (!valid && getSender.role !== 1) {
        console.log("Forbidden");
        return null;
      }

      const newChat = await Chat.create({
        sender: sender,
        room: id,
        chat,
      });

      if (newChat) {
        const getNewChat = await Chat.findOne({ _id: newChat._id }).populate(
          "sender"
        );

        const newChat = await Chat.create({
          sender: req.user.id,
          room: id,
          chat,
        });

        const newNotif = await ChatNotification.create({
          chat: newChat._id,
          users: room.users,
        });

        let notification = await ChatNotification.findById(newNotif._id, {})
          .populate("users", "name")
          .populate("chat", "sender chat read createdAt");

        notification = await Chat.populate(notification, {
          path: "chat.sender",
          select: "name",
        });

        const data = {
          newChat: getNewChat,
          notification,
        };

        return data;
      }
    } catch (error) {
      console.log(error);
      return error.message;
    }
  },
};
