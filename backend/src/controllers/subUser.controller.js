import * as subUserService from "../services/subUser.services.js";
import catchAsync from "../utils/catchAsync.js";

export const createSubUser = catchAsync(async (req, res) => {
  try {
    const subuser = await subUserService.createSubUser(req.body, req.user._id);
    res.status(201).json({
      error: false,
      success: true,
      message: "Subuser created successfully",
      subuser,
    });
  } catch (error) {
    if (error.message === "Subuser already exists") {
      return res.status(400).json({
        error: true,
        success: false,
        message: error.message,
      });
    }
    throw error; // Let the global error handler handle other errors
  }
});

export const getAllSubUsers = catchAsync(async (req, res) => {
  try {
    const subusers = await subUserService.getAllSubUsers(req.user._id);
    res.status(200).json({
      error: false,
      success: true,
      message: "Subusers fetched successfully",
      subusers,
    });
  } catch (error) {
    throw error; // Let the global error handler handle other errors
  }
});
export const updateSubUser = catchAsync(async (req, res) => {
  try {
    const subuser = await subUserService.updateSubUser(req.params.id, req.body);
    res.status(200).json({
      error: false,
      success: true,
      message: "Subuser updated successfully",
      subuser,
    });
  } catch (error) {
    throw error; // Let the global error handler handle other errors
  }
});
export const deleteSubUser = catchAsync(async (req, res) => {
  try {
    const subuser = await subUserService.deleteSubUser(req.params.id);
    res.status(200).json({
      error: false,
      success: true,
      message: "Subuser deleted successfully",
      subuser,
    });
  } catch (error) {
    throw error; // Let the global error handler handle other errors
  }
});
export const getSubUserById = catchAsync(async (req, res) => {
  try {
    const subuser = await subUserService.getSubUserById(req.params.id);
    res.status(200).json({
      error: false,
      success: true,
      message: "Subuser fetched successfully",
      subuser,
    });
  } catch (error) {
    throw error; // Let the global error handler handle other errors
  }
});
export const changeSubUserStatus = catchAsync(async (req, res) => {
  try {
    const subuser = await subUserService.changeSubUserStatus(
      req.params.id,
      req.body.status,
    );
    res.status(200).json({
      error: false,
      success: true,
      message: "Subuser status changed successfully",
      subuser,
    });
  } catch (error) {
    throw error; // Let the global error handler handle other errors
  }
});
export const subuserDeleteStatus = catchAsync(async (req, res) => {
  try {
    const subuser = await subUserService.subuserDeleteStatus(
      req.params.id,
      req.body.status,
    );
    res.status(200).json({
      error: false,
      success: true,
      message: "Subuser delete status changed successfully",
      subuser,
    });
  } catch (error) {
    throw error; // Let the global error handler handle other errors
  }
});
