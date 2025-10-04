import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Container,
  Grid,
  Card,
  CardContent,
  Button,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  CircularProgress,
} from "@mui/material";
import Add from "@mui/icons-material/Add";
import LocalShipping from "@mui/icons-material/LocalShipping";
import Inventory from "@mui/icons-material/Inventory";
import Assessment from "@mui/icons-material/Assessment";
import { useWeb3 } from "../contexts/Web3Context";
import apiClient from "../services/api";
import { toast } from "react-toastify";

const Dashboard = () => {
  const { account, userRole, hasRole } = useWeb3();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogType, setDialogType] = useState("");
  const [formData, setFormData] = useState({});

  useEffect(() => {
    if (account) {
      fetchUserItems();
    }
  }, [account]);

  const fetchUserItems = async () => {
    try {
      const response = await apiClient.get(`/api/items/owner/${account}`);
      setItems(response.data.items);
    } catch (error) {
      console.error("Error fetching items:", error);
      toast.error("Failed to fetch items");
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDialog = (type) => {
    setDialogType(type);
    setFormData({});
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setFormData({});
  };

  const handleFormSubmit = async () => {
    try {
      let endpoint = "";
      switch (dialogType) {
        case "ingredient":
          endpoint = "/api/transactions/create";
          break;
        case "combine":
          endpoint = "/api/transactions/combine";
          break;
        case "ship":
          endpoint = "/api/transactions/ship";
          break;
        default:
          throw new Error("Invalid dialog type");
      }

      const response = await apiClient.post(endpoint, formData);
      toast.success(`Transaction submitted: ${response.data.transactionHash}`);
      handleCloseDialog();

      // Refresh items after a delay
      setTimeout(fetchUserItems, 3000);
    } catch (error) {
      console.error("Transaction error:", error);
      toast.error(error.response?.data?.message || "Transaction failed");
    }
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

  if (!account) {
    return (
      <Container>
        <Alert severity="warning">
          Please connect your wallet to access the dashboard.
        </Alert>
      </Container>
    );
  }

  if (!userRole || userRole.length === 0) {
    return (
      <Container>
        <Alert severity="info">
          Your account doesn't have any roles assigned. Please contact an
          administrator.
        </Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="xl">
      <Typography variant="h4" gutterBottom>
        Supply Chain Dashboard
      </Typography>

      <Typography variant="subtitle1" color="text.secondary" gutterBottom>
        Welcome back! Manage your supply chain operations.
      </Typography>

      {/* Action Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {hasRole("FARMER") && (
          <Grid item xs={12} sm={6} md={3}>
            <Card
              sx={{
                cursor: "pointer",
                "&:hover": { boxShadow: 6 },
              }}
              onClick={() => handleOpenDialog("ingredient")}
            >
              <CardContent sx={{ textAlign: "center" }}>
                <Add color="primary" sx={{ fontSize: 48, mb: 2 }} />
                <Typography variant="h6">Create Ingredient</Typography>
                <Typography variant="body2" color="text.secondary">
                  Add new raw ingredients to the supply chain
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        )}

        {hasRole("MANUFACTURER") && (
          <Grid item xs={12} sm={6} md={3}>
            <Card
              sx={{
                cursor: "pointer",
                "&:hover": { boxShadow: 6 },
              }}
              onClick={() => handleOpenDialog("combine")}
            >
              <CardContent sx={{ textAlign: "center" }}>
                <Inventory color="primary" sx={{ fontSize: 48, mb: 2 }} />
                <Typography variant="h6">Combine Items</Typography>
                <Typography variant="body2" color="text.secondary">
                  Create products from ingredients
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        )}

        {hasRole("LOGISTICS") && (
          <Grid item xs={12} sm={6} md={3}>
            <Card
              sx={{
                cursor: "pointer",
                "&:hover": { boxShadow: 6 },
              }}
              onClick={() => handleOpenDialog("ship")}
            >
              <CardContent sx={{ textAlign: "center" }}>
                <LocalShipping color="primary" sx={{ fontSize: 48, mb: 2 }} />
                <Typography variant="h6">Ship Item</Typography>
                <Typography variant="body2" color="text.secondary">
                  Send items to the next party
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        )}

        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ bgcolor: "primary.main", color: "white" }}>
            <CardContent sx={{ textAlign: "center" }}>
              <Assessment sx={{ fontSize: 48, mb: 2 }} />
              <Typography variant="h6">My Items</Typography>
              <Typography variant="h4">{items.length}</Typography>
              <Typography variant="body2" sx={{ opacity: 0.8 }}>
                Items in your inventory
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Items Table */}
      <Paper>
        <Box sx={{ p: 2 }}>
          <Typography variant="h6" gutterBottom>
            My Inventory
          </Typography>
        </Box>

        {loading ? (
          <Box sx={{ display: "flex", justifyContent: "center", p: 4 }}>
            <CircularProgress />
          </Box>
        ) : (
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Product ID</TableCell>
                  <TableCell>Lot Code</TableCell>
                  <TableCell>Created</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {items.map((item) => (
                  <TableRow key={item.item_id}>
                    <TableCell>{item.product_id}</TableCell>
                    <TableCell>
                      <Chip label={item.lot_code} size="small" />
                    </TableCell>
                    <TableCell>
                      {new Date(item.creation_date).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      <Button size="small" variant="outlined">
                        View Details
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
                {items.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={4} align="center">
                      <Typography color="text.secondary">
                        No items found
                      </Typography>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Paper>

      {/* Dialogs */}
      <Dialog
        open={dialogOpen}
        onClose={handleCloseDialog}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          {dialogType === "ingredient" && "Create New Ingredient"}
          {dialogType === "combine" && "Combine Items"}
          {dialogType === "ship" && "Ship Item"}
        </DialogTitle>
        <DialogContent>
          {dialogType === "ingredient" && (
            <Box sx={{ pt: 1 }}>
              <TextField
                fullWidth
                label="Product ID"
                value={formData.productId || ""}
                onChange={(e) =>
                  setFormData({ ...formData, productId: e.target.value })
                }
                sx={{ mb: 2 }}
              />
              <TextField
                fullWidth
                label="Lot Code"
                value={formData.lotCode || ""}
                onChange={(e) =>
                  setFormData({ ...formData, lotCode: e.target.value })
                }
                sx={{ mb: 2 }}
              />
              <TextField
                fullWidth
                label="Location"
                value={formData.location || ""}
                onChange={(e) =>
                  setFormData({ ...formData, location: e.target.value })
                }
                sx={{ mb: 2 }}
              />
              <TextField
                fullWidth
                label="Private Key"
                type="password"
                value={formData.privateKey || ""}
                onChange={(e) =>
                  setFormData({ ...formData, privateKey: e.target.value })
                }
                helperText="Your private key is needed to sign the transaction"
              />
            </Box>
          )}

          {/* Add more dialog content for other types */}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button onClick={handleFormSubmit} variant="contained">
            Submit Transaction
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default Dashboard;
