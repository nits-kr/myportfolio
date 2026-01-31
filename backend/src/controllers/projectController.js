import Project from "../models/Project.js";

export const getProjects = async (req, res, next) => {
  try {
    const projects = await Project.find({ deleteStatus: { $ne: true } }).sort({
      createdAt: -1,
    });

    res.status(200).json({
      success: true,
      message: "Projects fetched successfully",
      count: projects.length,
      data: projects,
    });
  } catch (err) {
    res.status(500).json({
      error: true,
      success: false,
      message: "Server Error",
      error: "Server Error",
    });
  }
};

export const getProject = async (req, res, next) => {
  try {
    const project = await Project.findById(req.params.id);

    if (!project) {
      return res.status(404).json({
        success: false,
        message: "Project not found",
        error: "Project not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Project fetched successfully",
      data: project,
    });
  } catch (err) {
    res
      .status(500)
      .json({ success: false, message: "Server Error", error: "Server Error" });
  }
};

export const createProject = async (req, res, next) => {
  try {
    const project = await Project.create(req.body);

    res.status(201).json({
      success: true,
      message: "Project created successfully",
      data: {},
    });
  } catch (err) {
    if (err.name === "ValidationError") {
      const messages = Object.values(err.errors).map((val) => val.message);
      return res
        .status(400)
        .json({ success: false, message: "Validation Error", error: messages });
    } else {
      return res.status(500).json({
        success: false,
        message: "Server Error",
        error: "Server Error",
      });
    }
  }
};

export const updateProject = async (req, res, next) => {
  try {
    let project = await Project.findById(req.params.id);

    if (!project) {
      return res.status(404).json({
        success: false,
        message: "Project not found",
        error: "Project not found",
      });
    }

    project = await Project.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    res.status(200).json({
      success: true,
      message: "Project updated successfully",
      data: project,
    });
  } catch (err) {
    res.status(500).json({ success: false, error: "Server Error" });
  }
};

export const deleteProject = async (req, res, next) => {
  try {
    const project = await Project.findById(req.params.id);

    if (!project) {
      return res
        .status(404)
        .json({ success: false, error: "Project not found" });
    }

    await project.deleteOne();

    res.status(200).json({
      success: true,
      message: "Project deleted successfully",
      data: {},
    });
  } catch (err) {
    res
      .status(500)
      .json({ success: false, message: "Server Error", error: "Server Error" });
  }
};

export const deleteStatus = async (req, res, next) => {
  try {
    const project = await Project.findById(req.params.id);

    if (!project) {
      return res
        .status(404)
        .json({
          message: "Project not found",
          success: false,
          error: "Project not found",
        });
    }

    // Perform soft delete
    project.deleteStatus = true;
    project.deletedAt = Date.now();
    await project.save();

    res.status(200).json({
      success: true,
      message: "Project soft-deleted successfully",
      data: project,
    });
  } catch (err) {
    res
      .status(500)
      .json({ success: false, message: "Server Error", error: "Server Error" });
  }
};
