const mongoose = require('mongoose');
const Payment = require('../models/Payment');
const Session = require('../models/Session');
const Client = require('../models/Client');

/**
 * @desc Get analytics dashboard data using real MongoDB aggregation pipelines
 * @route GET /api/analytics
 */
const getAnalytics = async (req, res, next) => {
  try {
    const therapistId = req.therapist._id;

    // 1. Aggregation Pipeline: Monthly Revenue Trend
    const revenueTrendPipeline = [
      {
        $match: {
          therapist_id: new mongoose.Types.ObjectId(therapistId),
          status: 'captured'
        }
      },
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' }
          },
          totalRevenue: { $sum: '$amount' },
          netEarnings: { $sum: '$net_amount' },
          transactionCount: { $sum: 1 }
        }
      },
      {
        $sort: { '_id.year': 1, '_id.month': 1 }
      }
    ];

    // 2. Aggregation Pipeline: Session Status Breakdown (For No-Show Rate)
    const sessionStatusPipeline = [
      {
        $match: {
          therapist_id: new mongoose.Types.ObjectId(therapistId)
        }
      },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ];

    // 3. Aggregation Pipeline: Top Client Retention (Sessions per client)
    const clientRetentionPipeline = [
      {
        $match: {
          therapist_id: new mongoose.Types.ObjectId(therapistId)
        }
      },
      {
        $group: {
          _id: '$client_id',
          totalSessions: { $sum: 1 },
          completedSessions: {
            $sum: { $cond: [{ $eq: ['$status', 'completed'] }, 1, 0] }
          }
        }
      },
      {
        $lookup: {
          from: 'clients',
          localField: '_id',
          foreignField: '_id',
          as: 'clientInfo'
        }
      },
      { $unwind: '$clientInfo' },
      {
        $project: {
          clientName: '$clientInfo.name',
          totalSessions: 1,
          completedSessions: 1
        }
      },
      { $sort: { totalSessions: -1 } },
      { $limit: 5 }
    ];

    const [revenueTrendRaw, sessionStatusRaw, clientRetention] = await Promise.all([
      Payment.aggregate(revenueTrendPipeline),
      Session.aggregate(sessionStatusPipeline),
      Session.aggregate(clientRetentionPipeline)
    ]);

    // Format monthly revenue trend for charts
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const revenueTrend = revenueTrendRaw.map(item => ({
      month: `${monthNames[item._id.month - 1]} ${item._id.year}`,
      revenue: item.totalRevenue,
      net: item.netEarnings,
      transactions: item.transactionCount
    }));

    // Calculate No-Show Rate
    let totalSessions = 0;
    let noShows = 0;
    let completed = 0;
    let scheduled = 0;
    let cancelled = 0;

    sessionStatusRaw.forEach(stat => {
      totalSessions += stat.count;
      if (stat._id === 'no_show') noShows = stat.count;
      if (stat._id === 'completed') completed = stat.count;
      if (stat._id === 'scheduled') scheduled = stat.count;
      if (stat._id === 'cancelled') cancelled = stat.count;
    });

    const noShowRate = totalSessions > 0 ? ((noShows / totalSessions) * 100).toFixed(1) : 0;
    const completionRate = totalSessions > 0 ? ((completed / totalSessions) * 100).toFixed(1) : 0;

    const totalRevenueSum = revenueTrend.reduce((acc, curr) => acc + curr.revenue, 0);
    const activeClientsCount = await Client.countDocuments({ therapist_id: therapistId, status: 'active' });

    res.json({
      success: true,
      metrics: {
        totalRevenue: totalRevenueSum,
        activeClients: activeClientsCount,
        noShowRate: Number(noShowRate),
        completionRate: Number(completionRate),
        sessionDistribution: {
          scheduled,
          completed,
          noShows,
          cancelled,
          total: totalSessions
        }
      },
      revenueTrend,
      clientRetention
    });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getAnalytics
};
