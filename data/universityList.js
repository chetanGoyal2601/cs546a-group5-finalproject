/*
    Devshree Parikh
    Program: Master's in Computer Science
    CWID : 10476941
*/
const mongoCollections = require('../config/mongoCollections');
const universitiesMongo = mongoCollections.universities;
const commentsMongo = mongoCollections.comments;
const profileMongo = mongoCollections.profiles;
const validation = require("./validation");
let { ObjectId } = require('mongodb');

let exportedMethods = {

    // Function To get list of universities
   async universityList() {
        const universityCollection = await universitiesMongo();
        const uniList = await universityCollection
          .find({}, {projection: {_id: 1, name: 1}})
          .toArray();
          
        return uniList;
      },
    
     // Function To get data of individual university
    async getUniversityById(id)
    {
        if(id == null ) throw 'Error';
        if(!id) throw 'Error';
        if(typeof id != 'string') throw 'Error';
        if (id === undefined) throw 'You must provide an ID';
        id = id.trim();
        let newId;
        if(isJSON(id))
        {
            newId = JSON.parse(id);
            let parsedId = ObjectId(newId);
            if(!ObjectId.isValid(parsedId)) throw 'Object Id is not valid';
            const universityCollection = await universitiesMongo();
            const uniList = await universityCollection.findOne({_id: parsedId});
            if (!uniList) {
                throw 'Could not find university with id of ' + id;
            }
            if(uniList.comments.length !== 0)
            {
                const commentList = await this.getCommentsByIds(uniList.comments);
                if(commentList)
                {
                    uniList['commentsText'] = commentList;
                }
            }
            return uniList;
        }
        else
        {
            let parsedId = ObjectId(id);
            if (!ObjectId.isValid(parsedId)) throw 'invalid object ID';
            const universityCollection = await universitiesMongo();
            const uniList = await universityCollection.findOne({_id: parsedId});
            if (!uniList) {
                throw 'Could not find university with id of ' + id;
            }
            if(uniList.comments.length !== 0)
            {
                const commentList = await this.getCommentsByIds(uniList.comments);
                if(commentList)
                {
                    uniList['commentsText'] = commentList;
                }
            }
            return uniList;
        }
        function isJSON(str) 
        {
            try 
            {
                JSON.parse(str);
                return true;
            } 
            catch (err) 
            {
                return false;
            }
        }
    },
    //function to add comment on university page
    async postCommentOnUniversity(comment,universityId)
    {   
    if(typeof comment !== "string" ) throw `You must provide a valid string`;
    if(!comment) throw `You must enter a comment`;
    if (comment.trim().length === 0)
    {
        throw `Cannot be an empty string`;
    }
    comment = comment.trim();
    const commentsCollection = await commentsMongo();
    let comments ={
        userId:ObjectId('62702dcda133812c4f7c8060'),
        text: comment,
       
    }
    const insertInfo = await commentsCollection.insertOne(comments);
    if(insertInfo.insertCount === 0 || !insertInfo.insertedId) throw `could not add comments`;
    let newId = insertInfo.insertedId.toString();
    if(newId)
    {
        const insertComments = await this.addCommentsToUniversity(universityId,newId);
    }
    newId = JSON.stringify(newId);        
    const uniComment = await this.get(newId);
    return uniComment;
},
//Function to get comments from comments collection
async get(id) {
    if (!id) throw "You must provide an id to search for";
    if (typeof id != "string") throw "Id is not a string";
    id = JSON.parse(id);
    let parsedId = ObjectId(id);
    if (!ObjectId.isValid(parsedId)) throw "Object Id is not valid";
    const commentsCollection = await commentsMongo();
    const data = await commentsCollection.findOne({ _id: parsedId }, {
        projection: {
            _id: 1,
            userId: 1,
            text: 1,
        },
    });
    if (data === null) throw "No comment with that id";
    return data;
},
//Function to add comments to university collection 
async addCommentsToUniversity(id,commentsId) {
    if (!id) throw "You must provide an id to search for";
    if (typeof id != "string") throw "Id is not a string";
    let parsedId = ObjectId(id);
    if (!ObjectId.isValid(parsedId)) throw "Object Id is not valid";
    const universityCollection = await universitiesMongo();
    const data = await universityCollection.updateOne({ _id: parsedId }, {
        $push: {
            comments: {_id: ObjectId(commentsId)}
        }
    });
    if (data === null) throw "No university with that id";
    return data;
},

    //Funtion to display comments on individual university
    async  getCommentsByIds(inputCommentIds) {
       
        for (let index = 0; index < inputCommentIds.length; index++) {
          inputCommentIds[index] = ObjectId(inputCommentIds[index]._id);
        }
        const commentsCollection = await commentsMongo();
      const profileCollection = await profileMongo();
        let commentList = await commentsCollection
          .find({ _id: { $in: inputCommentIds } })
          .toArray();
        if (!commentList) throw { message: "Could not get all comments", code: 400 };
        for (let index = 0; index < commentList.length; index++) {
            commentList[index].userId = commentList[index].userId.toString();
            const user = await profileCollection.findOne({
              _id: ObjectId(commentList[index].userId),
            });
            if(user)
            {
                commentList[index]['userName'] = user.name;
            }            
          commentList[index]._id = commentList[index]._id.toString();
        }
        return commentList;
      },

    //Function to add favorite universities
    async addFavUniversity(id)
    {
        if (!id) throw "You must provide an id";
        if (typeof id != "string") throw "Id is not a string";
        let parsedId = ObjectId(id);
        if (!ObjectId.isValid(parsedId)) throw "Object Id is not valid";
        const profileCollection = await profileMongo();
        const data = await profileCollection.updateOne({ _id: parsedId }, {
            $push: {
                favouriteUniversities: {_id: ObjectId(commentsId)}
            }
        });
        if (data === null) throw "No university with that id";
        return data;
    }
}

module.exports = exportedMethods;