// Doorstep Delivery & Courier Rate API Service

const calculateDeliveryFee = (originAddress, destAddress, weightKg = 2) => {
  const baseFee = 8.50;
  const perKgFee = 1.20;
  const estimatedFee = baseFee + (weightKg * perKgFee);

  return {
    courierName: 'Marketplace Express Courier (Door-to-Door)',
    estimatedFee: parseFloat(estimatedFee.toFixed(2)),
    deliveryTimeMinutes: 45,
    trackingCode: `TRK-EXPRESS-${Math.floor(100000 + Math.random() * 900000)}`
  };
};

const getLiveTrackingStatus = (trackingCode) => {
  return {
    trackingCode: trackingCode || 'TRK-EXPRESS-992144',
    status: 'in_transit',
    currentLocation: 'Broad St Distribution Center, Manhattan',
    estimatedArrival: '25 mins away',
    driver: {
      name: 'Michael Santos',
      phone: '+1 212-555-0988',
      vehicle: 'Electric Courier Bike #14'
    },
    steps: [
      { step: 'Order Picked Up', completed: true, time: '10:30 AM' },
      { step: 'In Transit', completed: true, time: '10:45 AM' },
      { step: 'Out for Delivery', completed: true, time: '11:00 AM' },
      { step: 'Delivered', completed: false }
    ]
  };
};

module.exports = { calculateDeliveryFee, getLiveTrackingStatus };
