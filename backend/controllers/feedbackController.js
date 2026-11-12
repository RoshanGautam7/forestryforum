const Feedback = require('../models/Feedback');

class FeedbackController {

  // Create new feedback
  async create(req, res) {
    try {
      const { name, question, asked_at_event } = req.body;

      if (!name || !question || asked_at_event === undefined) {
        return res.status(400).json({ 
          success: false, 
          message: 'Name, question, and asked_at_event are required' 
        });
      }

      const feedback = await Feedback.create({
        name,
        question,
        asked_at_event: asked_at_event === 'yes' || asked_at_event === true
      });

      res.status(201).json({
        success: true,
        message: 'Feedback submitted successfully!',
        data: feedback
      });

    } catch (error) {
      console.error('Error creating feedback:', error);
      res.status(500).json({ 
        success: false, 
        message: 'Failed to submit feedback', 
        error: error.message 
      });
    }
  }

  // Get all feedbacks
  async getAll(req, res) {
    try {
      const feedbacks = await Feedback.findAll({
        order: [['created_at', 'DESC']]
      });
      res.status(200).json({
        success: true,
        data: feedbacks
      });
    } catch (error) {
      console.error('Error fetching feedbacks:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch feedbacks',
        error: error.message
      });
    }
  }

  // Get feedback by ID
  async getById(req, res) {
    try {
      const { id } = req.params;
      const feedback = await Feedback.findByPk(id);
      if (!feedback) {
        return res.status(404).json({ 
          success: false, 
          message: 'Feedback not found' 
        });
      }
      res.status(200).json({ 
        success: true, 
        data: feedback 
      });
    } catch (error) {
      console.error('Error fetching feedback:', error);
      res.status(500).json({ 
        success: false, 
        message: 'Failed to fetch feedback', 
        error: error.message 
      });
    }
  }

  // Delete feedback
  async delete(req, res) {
    try {
      const { id } = req.params;
      const feedback = await Feedback.findByPk(id);
      
      if (!feedback) {
        return res.status(404).json({
          success: false,
          message: 'Feedback not found'
        });
      }

      await feedback.destroy();

      res.status(200).json({
        success: true,
        message: 'Feedback deleted successfully'
      });
    } catch (error) {
      console.error('Error deleting feedback:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to delete feedback',
        error: error.message
      });
    }
  }

  // Mark feedbacks as important (bulk update)
  async markAsImportant(req, res) {
    try {
      const { ids } = req.body;

      if (!ids || !Array.isArray(ids) || ids.length === 0) {
        return res.status(400).json({
          success: false,
          message: 'IDs array is required'
        });
      }

      const [updatedCount] = await Feedback.update(
        { is_important: true },
        {
          where: {
            id: ids
          }
        }
      );

      res.status(200).json({
        success: true,
        message: `${updatedCount} feedback(s) marked as important`,
        updatedCount
      });
    } catch (error) {
      console.error('Error marking feedbacks as important:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to mark feedbacks as important',
        error: error.message
      });
    }
  }
}

module.exports = new FeedbackController();

