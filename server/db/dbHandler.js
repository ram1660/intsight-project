import mongoose, { Schema, model, connect } from 'mongoose';

const Paste = new Schema({
    title: String,
    id: String,
    content: String
})

const UserPaste = new Schema({
    author: String,
    pastes: [{
        title: String,
        id: String,
        content: String
    }]
});


const UserPastesModel = new model('user-pastes', UserPaste);

export async function isAuthorExists(author) {
    return await UserPastesModel.exists({ author: author }) === null ? false : true;
}

export async function insertPaste(author, paste) {
    if (await isAuthorExists(author) === false) {
        await UserPastesModel.create({
            author: author,
            pastes: [paste]
        });
    } else {
        await UserPastesModel.updateOne({ author: author }, {
            $push: { pastes: paste }
        });
    }
}

export async function isDBEmpty() {
    return (await UserPastesModel.countDocuments()) === 0;
}

export async function insertManyPastes(author, pastes) {
    if (await isAuthorExists(author) === false) {
        await UserPastesModel.create({ author: author, pastes: pastes });
    } else {
        await UserPastesModel.updateOne({ author: author }, { $push: { pastes: pastes } });
    }
}

export async function isPasteIdExists(id) {
    // return await UserPastesModel.exists({ 'pastes.id': id }) === null ? false : true;
    return await UserPastesModel.exists({
        pastes: {
            $elemMatch: {
                id: id
            }
        }
    }) === null ? false : true;
}

export async function connectDB() {
    await connect('mongodb://127.0.0.1:27017/pastes');
}