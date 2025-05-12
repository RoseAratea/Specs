import React, { useEffect, useState } from 'react'; 
import OfficerSidebar from '../components/OfficerSidebar';
import { getDashboardAnalytics } from '../services/analyticsService';
import '../styles/OfficerDashboardPage.css'; // you can rename it to OfficerDashboard.css for consistency
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  PieChart, Pie, Cell,
  ResponsiveContainer
} from 'recharts';

const OfficerDashboardPage = () => {
  const [officer, setOfficer] = useState(null);
  const [analytics, setAnalytics] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const token = localStorage.getItem('officerAccessToken');

  useEffect(() => {
    async function fetchData() {
      try {
        // Get officer info
        const storedOfficer = localStorage.getItem('officerInfo');
        const officerData = storedOfficer ? JSON.parse(storedOfficer) : null;
        setOfficer(officerData);
        
        // Get analytics data
        if (token) {
          const analyticsData = await getDashboardAnalytics(token);
          setAnalytics(analyticsData);
        }
      } catch (error) {
        console.error("Failed to fetch data:", error);
      } finally {
        setIsLoading(false);
      }
    }
    
    fetchData();
  }, [token]);

  if (isLoading) {
    return <div className="loading">Loading Officer Dashboard...</div>;
  }

  if (!officer || !analytics) {
    return <div className="error-message">Unable to load dashboard data. Please try again later.</div>;
  }

  const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#AA3399"];

  const membershipInsights = analytics.membershipInsights;
  const membersByRequirementData = Object.entries(membershipInsights.membersByRequirement || {}).map(
    ([requirement, count]) => ({ requirement, count })
  );

  const paymentAnalytics = analytics.paymentAnalytics;
  const preferredPaymentData = paymentAnalytics.preferredPaymentMethods || [];

  const transformPaymentDetails = (data) => {
    let arr = [];
    Object.entries(data).forEach(([requirement, years]) => {
      Object.entries(years).forEach(([year, statuses]) => {
        arr.push({
          label: `${requirement} (${year})`,
          requirement,
          year,
          "Not Paid": statuses["Not Paid"] || 0,
          "Verifying": statuses["Verifying"] || 0,
          "Paid": statuses["Paid"] || 0
        });
      });
    });
    return arr;
  };
  const paymentDetailsData = transformPaymentDetails(paymentAnalytics.byRequirementAndYear || {});

  const eventsEngagement = analytics.eventsEngagement;
  const eventsData = eventsEngagement.events || [];
  const popularEvents = eventsEngagement.popularEvents || [];
  const popularEventsPieData = popularEvents.map(evt => ({
    name: evt.title,
    value: evt.participant_count
  }));

  const clearanceTracking = analytics.clearanceTracking;
  const clearanceByRequirementData = Object.entries(clearanceTracking.byRequirement || {}).map(
    ([requirement, statuses]) => ({ requirement, ...statuses })
  );
  const complianceByYearData = Object.entries(clearanceTracking.complianceByYear || {}).map(
    ([year, statuses]) => ({ year, ...statuses })
  );

  return (
    <div className="layout-container">
    <OfficerSidebar officer={officer} />
    <div className="main-content">
      <div className="dashboard-header">
        <h1>Officer Dashboard</h1>
      </div>

        {/* Membership Insights */}
        <div className="card analytics-section">
          <h2>Membership Insights</h2>
          <div className="stats-row">
            <div className="stat-box">
              <p>Total Paid Members</p>
              <h2>{membershipInsights.totalPaidMembers}</h2>
            </div>
            <div className="stat-box">
              <p>Active Members</p>
              <h2>{membershipInsights.activeMembers}</h2>
            </div>
            <div className="stat-box">
              <p>Inactive Members</p>
              <h2>{membershipInsights.inactiveMembers}</h2>
            </div>
          </div>
          <div className="chart-box">
            <h3>Members by Requirement</h3>
            {membersByRequirementData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={membersByRequirementData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="requirement" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="count" fill="#8884d8" name="Paid Members" />
                </BarChart>
              </ResponsiveContainer>
            ) : <p>No data available.</p>}
          </div>
        </div>

        {/* Payment Analytics */}
        <div className="card analytics-section">
          <h2>Payment Analytics</h2>
          <div className="stats-row">
            <div className="stat-box"><p>Not Paid</p><h2>{paymentAnalytics.notPaid}</h2></div>
            <div className="stat-box"><p>Verifying</p><h2>{paymentAnalytics.verifying}</h2></div>
            <div className="stat-box"><p>Paid</p><h2>{paymentAnalytics.paid}</h2></div>
          </div>

          {/* Preferred Payment Pie Chart */}
          <div className="chart-box">
            <h3>Preferred Payment Methods</h3>
            {preferredPaymentData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={preferredPaymentData}
                    dataKey="count"
                    nameKey="method"
                    cx="50%" cy="50%"
                    outerRadius={100}
                    fill="#8884d8"
                    label
                  >
                    {preferredPaymentData.map((entry, index) => (
                      <Cell key={index} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            ) : <p>No preferred payment methods data.</p>}
          </div>

          {/* Payment Details Bar Chart */}
          <div className="chart-box">
            <h3>Payment Details by Requirement & Year</h3>
            {paymentDetailsData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={paymentDetailsData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="label" angle={-45} textAnchor="end" height={80} />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="Not Paid" fill="#ff4d4d" />
                  <Bar dataKey="Verifying" fill="#ffd633" />
                  <Bar dataKey="Paid" fill="#82ca9d" />
                </BarChart>
              </ResponsiveContainer>
            ) : <p>No payment details data available.</p>}
          </div>
        </div>

        {/* Events Engagement */}
        <div className="card analytics-section">
          <h2>Events Engagement</h2>
          <div className="chart-box">
            <h3>All Events - Participation Rate</h3>
            {eventsData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={eventsData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="title" />
                  <YAxis label={{ value: 'Participation Rate (%)', angle: -90, position: 'insideLeft' }} />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="participation_rate" fill="#82ca9d" />
                </BarChart>
              </ResponsiveContainer>
            ) : <p>No events data available.</p>}
          </div>

          <div className="chart-box">
            <h3>Popular Events</h3>
            {popularEventsPieData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={popularEventsPieData}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={100}
                    fill="#8884d8"
                    label
                  >
                    {popularEventsPieData.map((entry, index) => (
                      <Cell key={index} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            ) : <p>No popular events data.</p>}
          </div>
        </div>

        {/* Clearance Tracking */}
        <div className="card analytics-section">
          <h2>Clearance Tracking</h2>
          <div className="chart-box">
            <h3>Clearance by Requirement</h3>
            {clearanceByRequirementData.length > 0 ? (
              clearanceByRequirementData.map((item, idx) => (
                <ResponsiveContainer key={idx} width="100%" height={250}>
                  <BarChart data={[item]} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="requirement" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="Clear" fill="#28a745" />
                    <Bar dataKey="Not Yet Cleared" fill="#ff4d4d" />
                  </BarChart>
                </ResponsiveContainer>
              ))
            ) : <p>No clearance tracking data available.</p>}
          </div>

          <div className="chart-box">
            <h3>Compliance by Year</h3>
            {complianceByYearData.length > 0 ? (
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={complianceByYearData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="year" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="Clear" fill="#28a745" />
                  <Bar dataKey="Not Yet Cleared" fill="#ff4d4d" />
                </BarChart>
              </ResponsiveContainer>
            ) : <p>No compliance data available.</p>}
          </div>
        </div>
      </div>
    </div>
  );
};

export default OfficerDashboardPage;