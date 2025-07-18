const Post = require('../models/Post');
const { postValidation } = require('../utils/validation');

const getPosts = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    const search = req.query.search || '';
    const category = req.query.category || '';

    let query = { status: 'published' };
    
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { content: { $regex: search, $options: 'i' } }
      ];
    }
    
    if (category) {
      query.category = category;
    }

    const posts = await Post.find(query)
      .populate('author', 'username')
      .populate('category', 'name')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Post.countDocuments(query);

    res.json({
      success: true,
      posts,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

const getPost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id)
      .populate('author', 'username')
      .populate('category', 'name')
      .populate('comments');

    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    await Post.findByIdAndUpdate(req.params.id, { $inc: { views: 1 } });

    res.json({
      success: true,
      post
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

const createPost = async (req, res) => {
  try {
    const { error } = postValidation(req.body);
    if (error) return res.status(400).json({ message: error.details[0].message });

    const postData = {
      ...req.body,
      author: req.user.id,
      featuredImage: req.file ? req.file.filename : null
    };

    const post = await Post.create(postData);
    const populatedPost = await Post.findById(post._id)
      .populate('author', 'username')
      .populate('category', 'name');

    res.status(201).json({
      success: true,
      post: populatedPost
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

const updatePost = async (req, res) => {
  try {
    const { error } = postValidation(req.body);
    if (error) return res.status(400).json({ message: error.details[0].message });

    const post = await Post.findById(req.params.id);
    
    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    if (post.author.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied' });
    }

    const updateData = { ...req.body };
    if (req.file) {
      updateData.featuredImage = req.file.filename;
    }

    const updatedPost = await Post.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    ).populate('author', 'username').populate('category', 'name');

    res.json({
      success: true,
      post: updatedPost
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

const deletePost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    
    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    if (post.author.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied' });
    }

    await Post.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: 'Post deleted successfully'
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

const getMyPosts = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const posts = await Post.find({ author: req.user.id })
      .populate('category', 'name')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Post.countDocuments({ author: req.user.id });

    res.json({
      success: true,
      posts,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = {
  getPosts,
  getPost,
  createPost,
  updatePost,
  deletePost,
  getMyPosts
};