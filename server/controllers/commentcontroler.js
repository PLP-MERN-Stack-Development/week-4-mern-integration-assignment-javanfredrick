const Comment = require('../models/Comment');
const { commentValidation } = require('../utils/validation');

const getComments = async (req, res) => {
  try {
    const comments = await Comment.find({ post: req.params.postId })
      .populate('author', 'username')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      comments
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

const createComment = async (req, res) => {
  try {
    const { error } = commentValidation(req.body);
    if (error) return res.status(400).json({ message: error.details[0].message });

    const commentData = {
      ...req.body,
      author: req.user.id
    };

    const comment = await Comment.create(commentData);
    const populatedComment = await Comment.findById(comment._id)
      .populate('author', 'username');

    res.status(201).json({
      success: true,
      comment: populatedComment
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

const updateComment = async (req, res) => {
  try {
    const comment = await Comment.findById(req.params.id);
    
    if (!comment) {
      return res.status(404).json({ message: 'Comment not found' });
    }

    if (comment.author.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied' });
    }

    const updatedComment = await Comment.findByIdAndUpdate(
      req.params.id,
      { content: req.body.content },
      { new: true, runValidators: true }
    ).populate('author', 'username');

    res.json({
      success: true,
      comment: updatedComment
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

const deleteComment = async (req, res) => {
  try {
    const comment = await Comment.findById(req.params.id);
    
    if (!comment) {
      return res.status(404).json({ message: 'Comment not found' });
    }

    if (comment.author.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied' });
    }

    await Comment.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: 'Comment deleted successfully'
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = {
  getComments,
  createComment,
  updateComment,
  deleteComment
};