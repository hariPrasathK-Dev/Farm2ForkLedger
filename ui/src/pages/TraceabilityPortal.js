import React, { useState } from "react";
import {
  Box,
  Typography,
  Container,
  Paper,
  TextField,
  Button,
  Card,
  CardContent,
  Grid,
  Chip,
  Alert,
  CircularProgress,
  Divider,
  List,
  ListItem,
  ListItemText,
  IconButton,
  Collapse,
} from "@mui/material";
import Search from "@mui/icons-material/Search";
import QrCodeScanner from "@mui/icons-material/QrCodeScanner";
import ExpandMore from "@mui/icons-material/ExpandMore";
import ExpandLess from "@mui/icons-material/ExpandLess";
import LocationOn from "@mui/icons-material/LocationOn";
import Thermostat from "@mui/icons-material/Thermostat";
import Person from "@mui/icons-material/Person";
import Schedule from "@mui/icons-material/Schedule";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { format } from "date-fns";
import apiClient from "../services/api";

const TraceabilityPortal = () => {
  const [lotCode, setLotCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [traceabilityData, setTraceabilityData] = useState(null);
  const [error, setError] = useState("");
  const [expandedItems, setExpandedItems] = useState({});

  const handleSearch = async () => {
    if (!lotCode.trim()) {
      setError("Please enter a lot code");
      return;
    }

    setLoading(true);
    setError("");
    setTraceabilityData(null);

    try {
      const response = await apiClient.get(`/api/traceability/${lotCode}`);
      setTraceabilityData(response.data);
    } catch (err) {
      setError(
        err.response?.data?.message ||
          err.response?.data?.error ||
          "Failed to fetch traceability data"
      );
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (event) => {
    if (event.key === "Enter") {
      handleSearch();
    }
  };

  const toggleExpanded = (itemId) => {
    setExpandedItems((prev) => ({
      ...prev,
      [itemId]: !prev[itemId],
    }));
  };

  const formatDate = (dateString) => {
    return format(new Date(dateString), "MMM dd, yyyy HH:mm");
  };

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case "created":
        return "success";
      case "in_transit":
        return "warning";
      case "received":
        return "info";
      case "consumed":
        return "default";
      case "recalled":
        return "error";
      default:
        return "default";
    }
  };

  const renderTraceabilityTree = (item, level = 0) => {
    if (!item) return null;

    const hasParents = item.parents && item.parents.length > 0;
    const isExpanded = expandedItems[item.item_id];

    return (
      <Card
        key={item.item_id}
        sx={{
          mb: 2,
          ml: level * 3,
          borderLeft: level > 0 ? "3px solid #e0e0e0" : "none",
        }}
      >
        <CardContent>
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <Box sx={{ flex: 1 }}>
              <Typography variant="h6" gutterBottom>
                {item.product_id || "Unknown Product"}
              </Typography>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Lot Code: {item.lot_code}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Created: {formatDate(item.creation_date)}
              </Typography>
            </Box>

            {hasParents && (
              <IconButton onClick={() => toggleExpanded(item.item_id)}>
                {isExpanded ? <ExpandLess /> : <ExpandMore />}
              </IconButton>
            )}
          </Box>

          {hasParents && (
            <Collapse in={isExpanded} timeout="auto" unmountOnExit>
              <Divider sx={{ my: 2 }} />
              <Typography variant="subtitle2" gutterBottom>
                Made from:
              </Typography>
              {item.parents.map((parent) =>
                renderTraceabilityTree(parent, level + 1)
              )}
            </Collapse>
          )}
        </CardContent>
      </Card>
    );
  };

  const renderTemperatureChart = (history) => {
    const temperatureData = history
      .filter((entry) => entry.temperature_celsius !== null)
      .map((entry) => ({
        timestamp: format(new Date(entry.timestamp), "MMM dd HH:mm"),
        temperature: parseFloat(entry.temperature_celsius),
        fullTime: entry.timestamp,
      }));

    if (temperatureData.length === 0) {
      return (
        <Alert severity="info">
          No temperature data available for this item.
        </Alert>
      );
    }

    return (
      <Box sx={{ height: 300, mt: 2 }}>
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={temperatureData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="timestamp" />
            <YAxis />
            <Tooltip
              labelFormatter={(value) => `Time: ${value}`}
              formatter={(value) => [`${value}°C`, "Temperature"]}
            />
            <Line
              type="monotone"
              dataKey="temperature"
              stroke="#00529B"
              strokeWidth={2}
              dot={{ r: 4 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </Box>
    );
  };

  return (
    <Container maxWidth="lg">
      {/* Header */}
      <Box sx={{ textAlign: "center", mb: 4 }}>
        <Typography variant="h3" component="h1" gutterBottom>
          Product Traceability Portal
        </Typography>
        <Typography variant="h6" color="text.secondary">
          Track your Rich's Pizza products from farm to fork
        </Typography>
      </Box>

      {/* Search Section */}
      <Paper sx={{ p: 4, mb: 4 }}>
        <Box sx={{ display: "flex", gap: 2, alignItems: "center", mb: 2 }}>
          <TextField
            fullWidth
            label="Enter Product Lot Code"
            value={lotCode}
            onChange={(e) => setLotCode(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="e.g., PZ123456"
            disabled={loading}
          />
          <Button
            variant="contained"
            size="large"
            startIcon={loading ? <CircularProgress size={20} /> : <Search />}
            onClick={handleSearch}
            disabled={loading}
            sx={{ minWidth: 120 }}
          >
            {loading ? "Searching..." : "Search"}
          </Button>
          <IconButton size="large" disabled>
            <QrCodeScanner />
          </IconButton>
        </Box>

        <Typography variant="body2" color="text.secondary">
          Enter the lot code found on your product packaging to view its
          complete supply chain journey.
        </Typography>
      </Paper>

      {/* Error Display */}
      {error && (
        <Alert severity="error" sx={{ mb: 4 }}>
          {error}
        </Alert>
      )}

      {/* Results */}
      {traceabilityData && (
        <Grid container spacing={4}>
          {/* Main Product Info */}
          <Grid item xs={12}>
            <Paper sx={{ p: 3 }}>
              <Typography variant="h5" gutterBottom>
                Product Information
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6} md={3}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Product ID
                  </Typography>
                  <Typography variant="body1">
                    {traceabilityData.item.product_id}
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Lot Code
                  </Typography>
                  <Typography variant="body1">
                    {traceabilityData.item.lot_code}
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Created
                  </Typography>
                  <Typography variant="body1">
                    {formatDate(traceabilityData.item.creation_date)}
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Current Owner
                  </Typography>
                  <Typography variant="body1" sx={{ wordBreak: "break-all" }}>
                    {traceabilityData.item.current_owner.slice(0, 10)}...
                  </Typography>
                </Grid>
              </Grid>
            </Paper>
          </Grid>

          {/* Supply Chain Tree */}
          <Grid item xs={12} md={8}>
            <Paper sx={{ p: 3 }}>
              <Typography variant="h5" gutterBottom>
                Supply Chain Tree
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                Click expand icons to view ingredient sources
              </Typography>
              {renderTraceabilityTree(traceabilityData.traceabilityTree)}
            </Paper>
          </Grid>

          {/* History Timeline */}
          <Grid item xs={12} md={4}>
            <Paper sx={{ p: 3 }}>
              <Typography variant="h5" gutterBottom>
                Event History
              </Typography>
              <List>
                {traceabilityData.history.map((event, index) => (
                  <ListItem
                    key={index}
                    divider={index < traceabilityData.history.length - 1}
                  >
                    <ListItemText
                      primary={
                        <Box
                          sx={{ display: "flex", alignItems: "center", gap: 1 }}
                        >
                          <Chip
                            label={event.status}
                            size="small"
                            color={getStatusColor(event.status)}
                          />
                          {event.temperature_celsius && (
                            <Chip
                              icon={<Thermostat />}
                              label={`${event.temperature_celsius}°C`}
                              size="small"
                              variant="outlined"
                            />
                          )}
                        </Box>
                      }
                      secondary={
                        <Box sx={{ mt: 1 }}>
                          <Typography variant="body2" color="text.secondary">
                            <Schedule
                              sx={{
                                fontSize: 16,
                                mr: 0.5,
                                verticalAlign: "middle",
                              }}
                            />
                            {formatDate(event.timestamp)}
                          </Typography>
                          {event.location && (
                            <Typography variant="body2" color="text.secondary">
                              <LocationOn
                                sx={{
                                  fontSize: 16,
                                  mr: 0.5,
                                  verticalAlign: "middle",
                                }}
                              />
                              {event.location}
                            </Typography>
                          )}
                          <Typography variant="body2" color="text.secondary">
                            <Person
                              sx={{
                                fontSize: 16,
                                mr: 0.5,
                                verticalAlign: "middle",
                              }}
                            />
                            {event.actor.slice(0, 10)}...
                          </Typography>
                        </Box>
                      }
                    />
                  </ListItem>
                ))}
              </List>
            </Paper>
          </Grid>

          {/* Temperature Chart */}
          <Grid item xs={12}>
            <Paper sx={{ p: 3 }}>
              <Typography variant="h5" gutterBottom>
                Temperature Monitoring
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                Temperature readings throughout the supply chain journey
              </Typography>
              {renderTemperatureChart(traceabilityData.history)}
            </Paper>
          </Grid>
        </Grid>
      )}

      {/* Demo Section */}
      {!traceabilityData && !loading && (
        <Paper sx={{ p: 4, textAlign: "center", bgcolor: "grey.50" }}>
          <Typography variant="h6" gutterBottom>
            Try These Demo Lot Codes
          </Typography>
          <Box
            sx={{
              display: "flex",
              justifyContent: "center",
              gap: 2,
              flexWrap: "wrap",
            }}
          >
            {["PZ123456", "FL001234", "CH007890"].map((code) => (
              <Chip
                key={code}
                label={code}
                onClick={() => setLotCode(code)}
                clickable
                variant="outlined"
              />
            ))}
          </Box>
        </Paper>
      )}
    </Container>
  );
};

export default TraceabilityPortal;
