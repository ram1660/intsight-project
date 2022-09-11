import mongoose, { Schema, model, connect } from 'mongoose';

const PasteData = new Schema({
    title: String,
    author: String,
    date: String,
    content: [String]
});

const PasteDataModel = new model('pastes', PasteData);

export async function addPaste(title, author, date, content) {
    const newPaste = new PasteDataModel({
        title: title,
        author: author,
        date: date,
        content: content
    });
    newPaste.save();
}

export async function isDBEmpty() {
    console.log(await PasteDataModel.countDocuments());
    return (await PasteDataModel.countDocuments()) === 0;
}

export async function insertManyPastes(pastes) {
    for (const paste of pastes) {
        await PasteDataModel.create(paste);
    }
}

export async function connectDB() {
    await connect('mongodb://127.0.0.1:27017/pastes');
}