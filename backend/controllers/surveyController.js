const Survey = require('../models/Survey');

class SurveyController {

  // Create new survey
  async create(req, res) {
    try {
      const { name, company_name, position, survey_response } = req.body;

      if (!name || !company_name || !position || !survey_response) {
        return res.status(400).json({ 
          success: false, 
          message: 'Name, company_name, position, and survey_response are required' 
        });
      }

      // Validate survey_response is an array with 20 items
      if (!Array.isArray(survey_response) || survey_response.length !== 20) {
        return res.status(400).json({ 
          success: false, 
          message: 'Survey response must be an array of 20 items' 
        });
      }

      // Validate all responses are 'yes' or 'no'
      const validResponses = survey_response.every(r => r === 'yes' || r === 'no');
      if (!validResponses) {
        return res.status(400).json({ 
          success: false, 
          message: 'All survey responses must be either "yes" or "no"' 
        });
      }

      // Calculate percentages
      const yesCount = survey_response.filter(r => r === 'yes').length;
      const noCount = survey_response.filter(r => r === 'no').length;
      const yesPercent = (yesCount / 20) * 100;
      const noPercent = (noCount / 20) * 100;

      const survey = await Survey.create({
        name,
        company_name,
        position,
        survey_response,
        yes_percent: yesPercent.toFixed(2),
        no_percent: noPercent.toFixed(2)
      });

      res.status(201).json({
        success: true,
        message: 'Survey submitted successfully!',
        data: survey
      });

    } catch (error) {
      console.error('Error creating survey:', error);
      res.status(500).json({ 
        success: false, 
        message: 'Failed to submit survey', 
        error: error.message 
      });
    }
  }

  // Get all surveys
  async getAll(req, res) {
    try {
      const surveys = await Survey.findAll({
        order: [['created_at', 'DESC']]
      });
      res.status(200).json({
        success: true,
        data: surveys
      });
    } catch (error) {
      console.error('Error fetching surveys:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch surveys',
        error: error.message
      });
    }
  }

  // Get survey by ID
  async getById(req, res) {
    try {
      const { id } = req.params;
      const survey = await Survey.findByPk(id);
      if (!survey) {
        return res.status(404).json({ 
          success: false, 
          message: 'Survey not found' 
        });
      }
      res.status(200).json({ 
        success: true, 
        data: survey 
      });
    } catch (error) {
      console.error('Error fetching survey:', error);
      res.status(500).json({ 
        success: false, 
        message: 'Failed to fetch survey', 
        error: error.message 
      });
    }
  }
}

module.exports = new SurveyController();

