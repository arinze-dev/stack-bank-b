const { UserModel } = require("../models/user");
// const { EmailCOnfirmRoute } = require("../route/Emailconfirmation");

const verifyUser = async (req, res) => {
  await UserModel.findOne({ emailToken: req.body.emailToken })
    .then((user) => {
      if (!user) {
        return res.status(404).send({ message: "User Not found." });
      }
      user.isVerified = true;
      user.save((err) => {
        if (err) {
          res.status(500).send({ message: err });
          return;
        }
      });
    })
    .catch((e) => console.log("error", e));
};

module.exports = {
  verifyUser: verifyUser,
};
