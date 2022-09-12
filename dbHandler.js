import mongoose, { Schema, model, connect } from 'mongoose';

const PasteData = new Schema({
    title: String,
    author: String,
    id: String,
    content: [String]
});

const PasteDataModel = new model('pastes', PasteData);

export async function insertPaste(title, author, id, content) {
    const newPaste = new PasteDataModel({
        title: title,
        author: author,
        id: id,
        content: content
    });
    newPaste.save();
}

export async function isDBEmpty() {
    return (await PasteDataModel.countDocuments()) === 0;
}

export async function insertManyPastes(pastes) {
    for (const paste of pastes) {
        await PasteDataModel.create(paste);
    }
}

export async function isPasteIdExists(id) {
    return await PasteDataModel.exists({id: id});
}

export async function connectDB() {
    await connect('mongodb://127.0.0.1:27017/pastes');
}