const Hotel = require('../models/Hotel');
const { AppError, asyncHandler } = require('../utils/helpers');

// Map feature keys → minimum plan required
const FEATURE_PLAN_MAP = {
  guestCRM:            'professional',
  employeeManagement:  'professional',
  housekeepingModule:  'professional',
  maintenanceTracking: 'professional',
  restaurantPOS:       'professional',
  channelManager:      'professional',
  advancedAnalytics:   'professional',
  revenueManagementAI: 'enterprise',
  multiProperty:       'enterprise',
  whiteLabel:          'enterprise',
  apiAccess:           'enterprise',
};

const PLAN_RANK = { starter: 1, professional: 2, enterprise: 3 };

exports.requireFeature = (featureKey) => asyncHandler(async (req, _res, next) => {
  const requiredPlan = FEATURE_PLAN_MAP[featureKey];
  if (!requiredPlan) return next();

  const hotelId = req.hotelId || req.user.hotel;
  if (!hotelId) return next(new AppError('Hotel not found', 404));

  const hotel = await Hotel.findById(hotelId).select('plan planStatus');
  if (!hotel) return next(new AppError('Hotel not found', 404));
  if (hotel.planStatus !== 'active' && hotel.planStatus !== 'trial') {
    return next(new AppError('Subscription is not active', 402));
  }

  const hotelRank    = PLAN_RANK[hotel.plan]    || 0;
  const requiredRank = PLAN_RANK[requiredPlan]  || 0;

  if (hotelRank < requiredRank) {
    return next(new AppError(
      `This feature requires the ${requiredPlan} plan. Current plan: ${hotel.plan}`,
      403
    ));
  }
  next();
});

// Enforce per-plan limits (e.g. max rooms, max staff)
const PLAN_LIMITS = {
  starter:      { rooms: 30,  staffAccounts: 1  },
  professional: { rooms: 150, staffAccounts: 5  },
  enterprise:   { rooms: Infinity, staffAccounts: Infinity },
};

exports.enforceLimit = (limitKey, Model) => asyncHandler(async (req, _res, next) => {
  const hotelId = req.hotelId || req.user.hotel;
  const hotel   = await Hotel.findById(hotelId).select('plan');
  if (!hotel) return next(new AppError('Hotel not found', 404));

  const limit = PLAN_LIMITS[hotel.plan]?.[limitKey];
  if (!limit || limit === Infinity) return next();

  const count = await Model.countDocuments({ hotel: hotelId });
  if (count >= limit) {
    return next(new AppError(
      `Your ${hotel.plan} plan allows a maximum of ${limit} ${limitKey}. Upgrade to add more.`,
      403
    ));
  }
  next();
});
