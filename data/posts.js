const mongoCollections = require("../config/mongoCollections");
const posts = mongoCollections.posts;
const users = mongoCollections.profiles;
const commentData = require("./comments");
const { ObjectId } = require("mongodb");

//create new post
async function createPost(userId, postText) {
  try {
    idValidation(userId);
    textValidation(postText);
    await userExistsValidation(userId); //validation for user existence in user collection
    const newPost = {
      userId: ObjectId(userId),
      text: postText.trim(),
      comments: [],
      likes: [],
    };

    const postsCollection = await posts();
    const insertedInfo = await postsCollection.insertOne(newPost);
    if (!insertedInfo.insertedId) {
      throw { code: 500, message: "Could not add post" };
    }
    postId = insertedInfo.insertedId.toString();
    postDetails = await getPost(postId);
    return postDetails;
  } catch (e) {
    throw {
      code: e.code || 500,
      message: e.message || "Internal Server Error Occured",
    };
  }
}

async function editPost(postId, newPostText) {
  try {
    idValidation(postId);
    textValidation(newPostText);
    newPostText = newPostText.trim();
    const postsCollection = await posts();
    const post = await postsCollection.findOne({ _id: ObjectId(postId) });
    if (post === null) throw { code: 404, message: "No post with that id" };
    if (post.text.trim() === newPostText) {
      return newPostText;
    }
    const updatedInfo = await postsCollection.updateOne(
      { _id: ObjectId(postId) },
      {
        $set: {
          text: newPostText,
        },
      }
    );
    if (updatedInfo.modifiedCount === 0) {
      throw { code: 400, message: "No update occured!" };
    }
    return true;
  } catch (e) {
    throw {
      code: e.code || 500,
      message: e.message || "Internal Server Error Occured",
    };
  }
}

//delete post
async function deletePost(postId) {
  try {
    idValidation(postId);
    const postsCollection = await posts();
    const post = await postsCollection.findOne({ _id: ObjectId(postId) });
    if (post === null) throw { code: 404, message: "No post with that id" };

    //first delete comments from comment collection
    await commentData.deleteCommentsByIds(post.comments);

    //delete the post
    const deletedInfo = await postsCollection.deleteOne({
      _id: ObjectId(postId),
    });
    if (deletedInfo.deletedCount !== 1) {
      throw { code: 400, message: "No delete occured!" };
    }
    return true;
  } catch (e) {
    throw {
      code: e.code || 500,
      message: e.message || "Internal Server Error Occured",
    };
  }
}

//get a post
async function getPost(postId) {
  try {
    idValidation(postId);
    const postsCollection = await posts();
    const post = await postsCollection.findOne({ _id: ObjectId(postId) });
    if (!post) throw { code: 400, message: "Could not get all posts!" };
    const userCollection = await users();
    post._id = post._id.toString();
    post.userId = post.userId.toString();
    post.commentListForEachPost = [];
    post.commentListForEachPost = await commentData.getCommentsByIds(
      post.comments
    );
    post.totalLikes = 0;
    post.totalLikes = post.likes.length;
    const user = await userCollection.findOne({ _id: ObjectId(post.userId) });
    //console.log(user);
    post.username = "";
    post.username = user.name;
    return post;
  } catch (e) {
    throw {
      code: e.code || 500,
      message: e.message || "Internal Server Error Occured",
    };
  }
}

//get all posts
async function getAllPosts() {
  try {
    const postsCollection = await posts();
    const postsList = await postsCollection.find({}).toArray();
    const userCollection = await users();
    //check if post lists is retrieved
    if (postsList === []) {
      return postsList;
    }
    if (!postsList) throw { code: 400, message: "Could not get all posts!" };
    for (const e of postsList) {
      e._id = e._id.toString();
      e.userId = e.userId.toString();
      e.commentListForEachPost = [];
      e.commentListForEachPost = await commentData.getCommentsByIds(e.comments);
      e.totalLikes = 0;
      e.totalLikes = e.likes.length;
      const user = await userCollection.findOne({ _id: ObjectId(e.userId) });
      //console.log(user);
      e.username = "";
      e.username = user.name;
      //console.log(e);
    }
    return postsList.reverse();
  } catch (e) {
    throw {
      code: e.code || 500,
      message: e.message || "Internal Server Error Occured",
    };
  }
}

//increase likes
async function increaseLike(userId, postId) {
  try {
    idValidation(userId);
    await userExistsValidation(userId);
    idValidation(postId);
    //below also acts as post validation while getting the post
    const postsCollection = await posts();
    const post = await postsCollection.findOne({ _id: ObjectId(postId) });
    if (post === null) throw { code: 404, message: "No post with that id" };
    //console.log(post.likes);
    let exists = false;
    for (const i of post.likes) {
      if (i.toString() === userId) {
        exists = true;
      }
    }
    if (!exists) {
      post.likes.push(ObjectId(userId));
    }
    //console.log(post.likes.includes(ObjectId(userId)));
    // if (!post.likes.includes(ObjectId(userId))) {
    //   post.likes.push(ObjectId(userId));
    // }
    const updatedInfo = await postsCollection.updateOne(
      { _id: ObjectId(postId) },
      {
        $set: {
          likes: post.likes,
        },
      }
    );
    if (updatedInfo.modifiedCount === 0) {
      throw { code: 400, message: "No update occured!" };
    }
    return true;
  } catch (e) {
    throw {
      code: e.code || 500,
      message: e.message || "Internal Server Error Occured",
    };
  }
}

//decrease likes
async function decreaseLike(userId, postId) {
  try {
    idValidation(userId);
    idValidation(postId);
    await userExistsValidation(userId);
    const postsCollection = await posts();
    const post = await postsCollection.findOne({ _id: ObjectId(postId) });
    if (post === null) throw { code: 404, message: "No post with that id" };
    for (var i = 0; i < post.likes.length; i++) {
      if (post.likes[i].toString() === userId) {
        post.likes.splice(i, 1);
      }
    }
    const updatedInfo = await postsCollection.updateOne(
      { _id: ObjectId(postId) },
      {
        $set: {
          likes: post.likes,
        },
      }
    );
    if (updatedInfo.modifiedCount === 0) {
      throw { code: 400, message: "No update occured!" };
    }
    return true;
  } catch (e) {
    throw {
      code: e.code || 500,
      message: e.message || "Internal Server Error Occured",
    };
  }
}

//create comment for posts
async function createCommentOnPost(userId, postId, text) {
  try {
    textValidation(text);
    idValidation(userId);
    idValidation(postId);
    await userExistsValidation(userId);
    text = text.trim();
    const commentId = await commentData.postComment(userId, text);
    const postsCollection = await posts();
    const post = await postsCollection.findOne({ _id: ObjectId(postId) });
    if (post === null) throw { code: 404, message: "No post with that id" };
    post.comments.push(ObjectId(commentId));
    const updatedInfo = await postsCollection.updateOne(
      { _id: ObjectId(postId) },
      {
        $set: {
          comments: post.comments,
        },
      }
    );
    if (updatedInfo.modifiedCount === 0) {
      throw { code: 400, message: "No update occured!" };
    }
    return true;
  } catch (e) {
    throw {
      code: e.code || 500,
      message: e.message || "Internal Server Error Occured",
    };
  }
}

//to check if text is string type
function textValidation(text) {
  if (!text)
    throw { code: 400, message: "You must provide a text in the post!" };
  if (typeof text !== "string")
    throw { code: 400, message: "post should be a string!" };
  if (text.trim().length === 0)
    throw { code: 400, message: "post can not be empty" };
}

//to check if id is string type and can be converted to object
function idValidation(id) {
  if (!id) throw { code: 400, message: "You must provide an id to search for" };
  if (typeof id !== "string")
    throw { code: 400, message: "Id must be a string" };
  if (id.trim().length === 0)
    throw { code: 400, message: "Id cannot be an empty string or just spaces" };
  id = id.trim();
  if (!ObjectId.isValid(id)) throw { code: 400, message: "invalid object ID" };
}

//to check if user id exists in user collection
async function userExistsValidation(userId) {
  try {
    idValidation(userId);
    const userCollection = await users();
    const user = await userCollection.findOne({ _id: ObjectId(userId) });
    if (user === null) throw { code: 404, message: "No user found" };
  } catch (e) {
    throw {
      code: e.code || 500,
      message: e.message || "Internal Server Error Occured",
    };
  }
}

module.exports = {
  createPost,
  editPost,
  deletePost,
  getAllPosts,
  createCommentOnPost,
  increaseLike,
  decreaseLike,
};
