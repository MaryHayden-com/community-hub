import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { TrendingUp, Users, Eye, Calendar, DollarSign, Star, MapPin, Activity } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from "recharts";

const COLORS = ['#097275', '#E2701B', '#911B1B', '#6B5B95', '#88B04B', '#F7CAC9', '#92A8D1', '#955251'];

const StatCard = ({ icon: Icon, title, value, change, color }) => (
  <Card>
    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
      <CardTitle className="text-sm font-medium">{title}</CardTitle>
      <Icon className={`w-4 h-4 ${color}`} />
    </CardHeader>
    <CardContent>
      <div className="text-2xl font-bold">{value}</div>
      {change && (
        <p className="text-xs text-muted-foreground mt-1">
          {change > 0 ? '+' : ''}{change}% from last week
        </p>
      )}
    </CardContent>
  </Card>
);

export default function AdminAnalyticsDashboard() {
  const [listings, setListings] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [engagement, setEngagement] = useState([]);
  const [attendance, setAttendance] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      base44.entities.CommunityListing.list(),
      base44.entities.ListingReview.filter({}),
      base44.entities.ListingEngagement.filter({}),
      base44.entities.EventAttendance.filter({}),
    ]).then(([listingsData, reviewsData, engagementData, attendanceData]) => {
      setListings(listingsData);
      setReviews(reviewsData);
      setEngagement(engagementData);
      setAttendance(attendanceData);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  // Calculate metrics
  const totalListings = listings.length;
  const activeListings = listings.filter(l => l.status === 'approved').length;
  const pendingListings = listings.filter(l => l.status === 'pending').length;
  const featuredListings = listings.filter(l => l.is_featured).length;
  const verifiedListings = listings.filter(l => l.is_verified).length;
  const paidListings = listings.filter(l => ['standard', 'premium'].includes(l.plan) && l.plan_status === 'active').length;
  
  const totalReviews = reviews.filter(r => r.is_approved).length;
  const avgRating = totalReviews > 0 
    ? (reviews.filter(r => r.is_approved).reduce((sum, r) => sum + r.rating, 0) / totalReviews).toFixed(1)
    : 0;

  const totalEngagement = engagement.length;
  const uniqueEngagedListings = new Set(engagement.map(e => e.listing_id)).size;
  
  const totalAttendance = attendance.filter(a => a.attending).length;
  const totalEvents = listings.filter(l => l.type === "What's On").length;

  // Listings by type
  const listingsByType = listings.reduce((acc, l) => {
    acc[l.type] = (acc[l.type] || 0) + 1;
    return acc;
  }, {});

  const typeChartData = Object.entries(listingsByType).map(([type, count]) => ({
    name: type,
    value: count,
  }));

  // Listings by county
  const listingsByCounty = listings.reduce((acc, l) => {
    acc[l.county] = (acc[l.county] || 0) + 1;
    return acc;
  }, {});

  const countyChartData = Object.entries(listingsByCounty)
    .map(([county, count]) => ({ county, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 10);

  // Engagement by type
  const engagementByType = engagement.reduce((acc, e) => {
    acc[e.event_type] = (acc[e.event_type] || 0) + 1;
    return acc;
  }, {});

  const engagementChartData = Object.entries(engagementByType).map(([type, count]) => ({
    type: type.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase()),
    count,
  }));

  // Recent activity (last 7 days)
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
  const recentEngagement = engagement.filter(e => new Date(e.created_date) >= sevenDaysAgo);
  const dailyEngagement = {};
  recentEngagement.forEach(e => {
    const date = new Date(e.created_date).toISOString().slice(0, 10);
    dailyEngagement[date] = (dailyEngagement[date] || 0) + 1;
  });

  const dailyChartData = Object.entries(dailyEngagement)
    .map(([date, count]) => ({ date: date.slice(5), count }))
    .sort((a, b) => a.date.localeCompare(b.date));

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-8 h-8 border-4 border-slate-200 border-t-slate-800 rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-display text-2xl font-bold">Platform Analytics</h2>
        <p className="text-muted-foreground">Comprehensive metrics and insights</p>
      </div>

      {/* High-level metrics */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          icon={Users}
          title="Total Listings"
          value={totalListings}
          color="text-primary"
        />
        <StatCard
          icon={Star}
          title="Average Rating"
          value={avgRating}
          color="text-amber-500"
        />
        <StatCard
          icon={Eye}
          title="Total Engagement"
          value={totalEngagement.toLocaleString()}
          color="text-blue-500"
        />
        <StatCard
          icon={Calendar}
          title="Event Attendees"
          value={totalAttendance}
          color="text-purple-500"
        />
      </div>

      {/* Detailed stats */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Listing Status</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Approved</span>
                <span className="font-medium">{activeListings}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Pending</span>
                <span className="font-medium">{pendingListings}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Featured</span>
                <span className="font-medium">{featuredListings}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Verified</span>
                <span className="font-medium">{verifiedListings}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Paid Plans</span>
                <span className="font-medium">{paidListings}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Engagement Breakdown</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Profile Views</span>
                <span className="font-medium">{engagementByType.view || 0}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Phone Clicks</span>
                <span className="font-medium">{engagementByType.phone_click || 0}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Website Clicks</span>
                <span className="font-medium">{engagementByType.website_click || 0}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Email Clicks</span>
                <span className="font-medium">{engagementByType.email_click || 0}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Social Clicks</span>
                <span className="font-medium">
                  {(engagementByType.facebook_click || 0) + (engagementByType.instagram_click || 0) + (engagementByType.linkedin_click || 0)}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Events Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Total Events</span>
                <span className="font-medium">{totalEvents}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Total RSVPs</span>
                <span className="font-medium">{totalAttendance}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Avg per Event</span>
                <span className="font-medium">{totalEvents > 0 ? (totalAttendance / totalEvents).toFixed(1) : 0}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid gap-4 md:grid-cols-2">
        {/* Listings by Type */}
        <Card>
          <CardHeader>
            <CardTitle className="text-sm flex items-center gap-2">
              <Activity className="w-4 h-4" />
              Listings by Type
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={typeChartData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {typeChartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Top Counties */}
        <Card>
          <CardHeader>
            <CardTitle className="text-sm flex items-center gap-2">
              <MapPin className="w-4 h-4" />
              Top 10 Counties
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={countyChartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="county" tick={{ fontSize: 10 }} />
                <YAxis />
                <Tooltip />
                <Bar dataKey="count" fill="#097275" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Daily Engagement */}
        <Card>
          <CardHeader>
            <CardTitle className="text-sm flex items-center gap-2">
              <TrendingUp className="w-4 h-4" />
              Engagement (Last 7 Days)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={dailyChartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="count" stroke="#E2701B" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Engagement Types */}
        <Card>
          <CardHeader>
            <CardTitle className="text-sm flex items-center gap-2">
              <Activity className="w-4 h-4" />
              Engagement Types
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={engagementChartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="type" tick={{ fontSize: 9 }} angle={-45} textAnchor="end" height={80} />
                <YAxis />
                <Tooltip />
                <Bar dataKey="count" fill="#911B1B" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}