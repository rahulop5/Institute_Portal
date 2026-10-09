import Student from "../models/feedback/Student.js";

// Lets a student edit or delete one of their own project updates. Shared by
// BTP, Honors and AP - each route file passes in its own models.
async function findOwnUpdate(req, res, Project, Registration, label) {
    const { updateId } = req.body;
    if (!updateId) {
        res.status(400).json({ message: "Update ID required" });
        return null;
    }

    const student = await Student.findOne({ email: req.user.email });
    if (!student) {
        res.status(404).json({ message: "Student not found" });
        return null;
    }

    const registration = await Registration.findOne({ student: student._id });
    const project = registration?.project ? await Project.findById(registration.project) : null;
    if (!project) {
        res.status(400).json({ message: `No ${label} project assigned` });
        return null;
    }
    if (project.status !== "active") {
        res.status(400).json({ message: `This ${label} project is no longer active` });
        return null;
    }

    const update = project.updates.id(updateId);
    if (!update) {
        res.status(404).json({ message: "Update not found" });
        return null;
    }
    return { project, update };
}

export const editUpdate = (Project, Registration, label) => async (req, res) => {
    try {
        const text = req.body.update?.trim();
        if (!text) return res.status(400).json({ message: "Update can't be empty" });

        const found = await findOwnUpdate(req, res, Project, Registration, label);
        if (!found) return;
        found.update.update = text;
        await found.project.save();
        return res.status(200).json({ message: "Update edited" });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ message: "Error editing update" });
    }
};

export const deleteUpdate = (Project, Registration, label) => async (req, res) => {
    try {
        const found = await findOwnUpdate(req, res, Project, Registration, label);
        if (!found) return;
        found.update.deleteOne();
        await found.project.save();
        return res.status(200).json({ message: "Update deleted" });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ message: "Error deleting update" });
    }
};
