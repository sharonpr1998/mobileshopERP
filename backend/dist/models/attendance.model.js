import mongoose, { Schema } from "mongoose";
const locationSchema = new Schema({
    latitude: { type: Number, required: true },
    longitude: { type: Number, required: true },
}, { _id: false });
const attendanceSchema = new Schema({
    userId: {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
    dateKey: {
        type: String,
        required: true,
    },
    checkInAt: {
        type: Date,
        required: true,
        default: Date.now,
    },
    checkOutAt: {
        type: Date,
    },
    checkInLocation: {
        type: locationSchema,
        required: true,
    },
    checkOutLocation: {
        type: locationSchema,
    },
    checkInSelfieUrl: {
        type: String,
        required: true,
    },
    checkInSelfiePublicId: {
        type: String,
        required: true,
    },
    checkOutSelfieUrl: {
        type: String,
    },
    checkOutSelfiePublicId: {
        type: String,
    },
}, { timestamps: true });
// One attendance record per staff member per day.
attendanceSchema.index({ userId: 1, dateKey: 1 }, { unique: true });
export default mongoose.model("Attendance", attendanceSchema);
