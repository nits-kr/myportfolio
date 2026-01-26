import SubUser from "../models/subUser.modal.js";
// import bcrypt from "bcryptjs"; // Removed as hashing is done in model

const createSubUser = async (subUserData, parentUserId) => {
  const { name, email, password, role, permissions } = subUserData;

  const existSubUser = await SubUser.findOne({ email });
  if (existSubUser) {
    throw new Error("Subuser already exists");
  }
  // Password hashing is now handled in the model pre-save hook

  const subuser = await SubUser.create({
    parentUser: parentUserId,
    name,
    email,
    password, // Pass plain password
    role,
    permissions,
  });

  return subuser;
};

const getAllSubUsers = async (parentUserId) => {
  const subusers = await SubUser.find({ parentUser: parentUserId });
  return subusers;
};

const updateSubUser = async (subUserId, subUserData) => {
  const subuser = await SubUser.findByIdAndUpdate(subUserId, subUserData, {
    new: true,
  });
  return subuser;
};

const deleteSubUser = async (subUserId) => {
  const subuser = await SubUser.findByIdAndDelete(subUserId);
  return subuser;
};
const getSubUserById = async (subUserId) => {
  const subuser = await SubUser.findById(subUserId);
  return subuser;
};

const changeSubUserStatus = async (subUserId, status) => {
  const subuser = await SubUser.findByIdAndUpdate(
    subUserId,
    { status },
    { new: true },
  );
  return subuser;
};

const subuserDeleteStatus = async (subUserId, status) => {
  const subuser = await SubUser.findByIdAndUpdate(
    subUserId,
    { status },
    { new: true },
  );
  return subuser;
};

export {
  createSubUser,
  getAllSubUsers,
  updateSubUser,
  deleteSubUser,
  getSubUserById,
  changeSubUserStatus,
  subuserDeleteStatus,
};
