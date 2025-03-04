import { Schema, model } from "mongoose";

const UserSchema = new Schema({
    githubId: { type: String, required: true },
});

export const UserModel = model("users", UserSchema);