export const pricingPlans = [
  { name: "Starter", price: "₹499", period: "/month", features: ["1 gym branch", "300 members", "Basic reports", "Email support"] },
  { name: "Professional", price: "₹999", period: "/month", featured: true, features: ["3 branches", "2,000 members", "Advanced analytics", "Priority support"] },
  { name: "Enterprise", price: "₹1999", period: "/month", features: ["Unlimited branches", "Custom roles", "Revenue insights", "Dedicated success manager"] }
];

export const stats = {
  admin: [
    ["Total Gyms", "128", "+12%"],
    ["Active Gyms", "104", "+8%"],
    ["Expired Gyms", "24", "-3%"],
    ["Total Members", "42,860", "+18%"],
    ["Monthly Revenue", "₹18.4L", "+21%"]
  ],
  owner: [
    ["Active Members", "842", "+32"],
    ["Inactive Members", "91", "-12"],
    ["Revenue Today", "₹42,500", "+9%"],
    ["Revenue This Month", "₹8.7L", "+15%"],
    ["Successful Payments", "716", "+44"],
    ["Pending Payments", "38", "-7"],
    ["Memberships Expiring Soon", "57", "7 days"]
  ],
  trainer: [["Assigned Members", "46", "+6"], ["Workout Plans", "18", "+3"], ["Diet Plans", "14", "+2"]],
  member: [["Membership Status", "Active", "Premium"], ["Expiry Date", "28 Jun 2026", "24 days"], ["Days Remaining", "24", "Renew soon"]]
};

export const revenueData = [
  { month: "Jan", revenue: 240000, subscriptions: 40, members: 320 },
  { month: "Feb", revenue: 310000, subscriptions: 52, members: 410 },
  { month: "Mar", revenue: 450000, subscriptions: 68, members: 530 },
  { month: "Apr", revenue: 520000, subscriptions: 79, members: 610 },
  { month: "May", revenue: 680000, subscriptions: 96, members: 760 },
  { month: "Jun", revenue: 740000, subscriptions: 112, members: 842 }
];

export const gyms = [
  { name: "Iron Core Fitness", owner: "Aarav Mehta", plan: "Professional", status: "Active", revenue: "₹92,000" },
  { name: "Pulse Studio", owner: "Neha Rao", plan: "Starter", status: "Active", revenue: "₹31,500" },
  { name: "Urban Lift", owner: "Kabir Shah", plan: "Enterprise", status: "Expired", revenue: "₹1,84,000" }
];

export const payments = [
  { member: "Riya Sen", plan: "Premium", amount: "₹1,500", status: "Success", date: "04 Jun 2026" },
  { member: "Vikram Jain", plan: "Elite", amount: "₹2,500", status: "Pending", date: "03 Jun 2026" },
  { member: "Ananya Das", plan: "Basic", amount: "₹1,000", status: "Failed", date: "02 Jun 2026" }
];

export const members = [
  { name: "Riya Sen", email: "riya@example.com", phone: "+91 98765 12340", plan: "Premium", start: "01 Jun 2026", expiry: "30 Jun 2026", status: "Active" },
  { name: "Vikram Jain", email: "vikram@example.com", phone: "+91 98765 12341", plan: "Elite", start: "20 May 2026", expiry: "19 Jun 2026", status: "Pending" },
  { name: "Ananya Das", email: "ananya@example.com", phone: "+91 98765 12342", plan: "Basic", start: "01 May 2026", expiry: "30 May 2026", status: "Expired" }
];

export const trainers = [
  { name: "Dev Malik", email: "dev@fitmanager.in", phone: "+91 90000 11111", specialization: "Strength", status: "Active" },
  { name: "Sara Khan", email: "sara@fitmanager.in", phone: "+91 90000 22222", specialization: "Yoga", status: "Active" },
  { name: "Nikhil Bose", email: "nikhil@fitmanager.in", phone: "+91 90000 33333", specialization: "HIIT", status: "Inactive" }
];

export const membershipPlans = [
  { name: "Basic", price: "₹1000", duration: "30 Days", description: "Access to gym floor and lockers." },
  { name: "Premium", price: "₹1500", duration: "30 Days", description: "Includes trainer check-ins and group classes." },
  { name: "Elite", price: "₹2500", duration: "30 Days", description: "Personal training, diet plan, and priority booking." }
];

export const dietPlans = [
  { title: "Lean Gain Plan", calories: "2200", description: "High protein meals for lean muscle.", meals: "Oats, paneer bowl, dal rice, protein shake" },
  { title: "Fat Loss Plan", calories: "1700", description: "Balanced calorie deficit plan.", meals: "Eggs, salad bowl, grilled tofu, soup" }
];

export const workoutPlans = [
  { title: "Push Pull Legs", description: "Six-day hypertrophy split.", exercises: "Bench press, rows, squats, overhead press" },
  { title: "Beginner Strength", description: "Three-day full body plan.", exercises: "Squat, deadlift, pushups, lat pulldown" }
];

export const testimonials = [
  "FitManager helped us replace spreadsheets with a real operating rhythm.",
  "Payments, renewals, and trainer plans are finally in one clean place.",
  "The dashboards give our owners instant clarity without extra admin work."
];
