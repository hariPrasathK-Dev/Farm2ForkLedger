import React, { useState } from "react";
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
  List,
  ListItem,
  ListItemText,
  Divider,
  MenuItem,
} from "@mui/material";
import SupervisorAccount from "@mui/icons-material/SupervisorAccount";
import Person from "@mui/icons-material/Person";
import Assessment from "@mui/icons-material/Assessment";
import { useWeb3 } from "../contexts/Web3Context";

const AdminDashboard = () => {
  const { hasRole } = useWeb3();
  const [users] = useState([
    // Demo data - in production, fetch from API
    {
      address: "0xf17f52151EbEF6C7334FAD080c5704D77216b732",
      role: "FARMER",
      name: "Green Valley Farm",
    },
    {
      address: "0xC5fdf4076b8F3A5357c5E395ab970B5B54098Fef",
      role: "MANUFACTURER",
      name: "Rich's Products",
    },
    {
      address: "0x821aEa9a577a9b44299B9c15c88cf3087F3b5544",
      role: "LOGISTICS",
      name: "LogiCorp Shipping",
    },
    {
      address: "0x0d1d4e623D10F9FBA5Db95830F7d3839406C6AF2",
      role: "RETAILER",
      name: "SuperMart Chain",
    },
  ]);

  const [stats] = useState({
    totalUsers: 4,
    totalItems: 156,
    activeShipments: 23,
    totalTransactions: 1247,
  });

  const [roleDialogOpen, setRoleDialogOpen] = useState(false);
  const [newUser, setNewUser] = useState({ address: "", role: "" });

  if (!hasRole("ADMIN")) {
    return (
      <Container>
        <Alert severity="error">
          Access denied. You need administrator privileges to view this page.
        </Alert>
      </Container>
    );
  }

  const handleGrantRole = () => {
    // In production, call smart contract to grant role
    console.log("Granting role:", newUser);
    setRoleDialogOpen(false);
    setNewUser({ address: "", role: "" });
  };

  const getRoleColor = (role) => {
    switch (role) {
      case "ADMIN":
        return "error";
      case "FARMER":
        return "success";
      case "MANUFACTURER":
        return "primary";
      case "LOGISTICS":
        return "warning";
      case "RETAILER":
        return "info";
      default:
        return "default";
    }
  };

  return (
    <Container maxWidth="xl">
      <Typography variant="h4" gutterBottom>
        Administrator Dashboard
      </Typography>

      <Typography variant="subtitle1" color="text.secondary" gutterBottom>
        Manage users, roles, and monitor system performance
      </Typography>

      {/* Stats Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: "flex", alignItems: "center" }}>
                <SupervisorAccount
                  color="primary"
                  sx={{ fontSize: 40, mr: 2 }}
                />
                <Box>
                  <Typography variant="h4">{stats.totalUsers}</Typography>
                  <Typography variant="body2" color="text.secondary">
                    Total Users
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: "flex", alignItems: "center" }}>
                <Assessment color="success" sx={{ fontSize: 40, mr: 2 }} />
                <Box>
                  <Typography variant="h4">{stats.totalItems}</Typography>
                  <Typography variant="body2" color="text.secondary">
                    Total Items
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: "flex", alignItems: "center" }}>
                <Assessment color="warning" sx={{ fontSize: 40, mr: 2 }} />
                <Box>
                  <Typography variant="h4">{stats.activeShipments}</Typography>
                  <Typography variant="body2" color="text.secondary">
                    Active Shipments
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: "flex", alignItems: "center" }}>
                <Assessment color="info" sx={{ fontSize: 40, mr: 2 }} />
                <Box>
                  <Typography variant="h4">
                    {stats.totalTransactions}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Total Transactions
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* User Management */}
      <Grid container spacing={3}>
        <Grid item xs={12} md={8}>
          <Paper>
            <Box
              sx={{
                p: 2,
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <Typography variant="h6">User Management</Typography>
              <Button
                variant="contained"
                startIcon={<Person />}
                onClick={() => setRoleDialogOpen(true)}
              >
                Grant Role
              </Button>
            </Box>

            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Address</TableCell>
                    <TableCell>Organization</TableCell>
                    <TableCell>Role</TableCell>
                    <TableCell>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {users.map((user) => (
                    <TableRow key={user.address}>
                      <TableCell sx={{ fontFamily: "monospace" }}>
                        {user.address.slice(0, 10)}...{user.address.slice(-8)}
                      </TableCell>
                      <TableCell>{user.name}</TableCell>
                      <TableCell>
                        <Chip
                          label={user.role}
                          color={getRoleColor(user.role)}
                          size="small"
                        />
                      </TableCell>
                      <TableCell>
                        <Button size="small" color="error">
                          Revoke
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
        </Grid>

        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              System Health
            </Typography>

            <List>
              <ListItem>
                <ListItemText
                  primary="Blockchain Network"
                  secondary={
                    <Chip label="Healthy" color="success" size="small" />
                  }
                />
              </ListItem>
              <Divider />
              <ListItem>
                <ListItemText
                  primary="Database Connection"
                  secondary={
                    <Chip label="Connected" color="success" size="small" />
                  }
                />
              </ListItem>
              <Divider />
              <ListItem>
                <ListItemText
                  primary="API Service"
                  secondary={
                    <Chip label="Running" color="success" size="small" />
                  }
                />
              </ListItem>
              <Divider />
              <ListItem>
                <ListItemText
                  primary="Indexer Service"
                  secondary={
                    <Chip label="Syncing" color="warning" size="small" />
                  }
                />
              </ListItem>
            </List>
          </Paper>
        </Grid>
      </Grid>

      {/* Grant Role Dialog */}
      <Dialog
        open={roleDialogOpen}
        onClose={() => setRoleDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Grant Role to User</DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            label="Ethereum Address"
            value={newUser.address}
            onChange={(e) =>
              setNewUser({ ...newUser, address: e.target.value })
            }
            sx={{ mb: 2, mt: 1 }}
            placeholder="0x..."
          />
          <TextField
            fullWidth
            select
            label="Role"
            value={newUser.role}
            onChange={(e) => setNewUser({ ...newUser, role: e.target.value })}
          >
            <MenuItem value="FARMER">Farmer</MenuItem>
            <MenuItem value="MANUFACTURER">Manufacturer</MenuItem>
            <MenuItem value="LOGISTICS">Logistics</MenuItem>
            <MenuItem value="RETAILER">Retailer</MenuItem>
            <MenuItem value="ADMIN">Administrator</MenuItem>
          </TextField>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setRoleDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleGrantRole} variant="contained">
            Grant Role
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default AdminDashboard;
