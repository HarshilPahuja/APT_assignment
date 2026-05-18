require("dotenv").config();

const express = require("express");
const http = require("http");
const cors = require("cors");

const { Server } = require("socket.io");

const { createClient } = require("@supabase/supabase-js");

const app = express();

app.use(cors());
app.use(express.json());

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "*",
  },
});


// ======================
// SUPABASE
// ======================

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_KEY
);


// ======================
// SOCKET.IO
// ======================

io.on("connection", (socket) => {

  console.log("Client connected:", socket.id);

  // customer joins own room
  socket.on("join_room", (username) => {

    socket.join(username);

    console.log(`${username} joined room`);
  });

  socket.on("disconnect", () => {
    console.log("Disconnected:", socket.id);
  });
});


// ======================
// LOGIN
// ======================

app.post("/login", async (req, res) => {

  const { username, password } = req.body;

  const { data, error } = await supabase
    .from("users")
    .select("*")
    .eq("username", username)
    .eq("password", password)
    .single();

  if (error || !data) {
    return res.status(401).json({
      success: false,
      message: "Invalid credentials",
    });
  }

  res.json({
    success: true,
    user: data,
  });
});


// ======================
// PLACE ORDER
// ======================

app.post("/orders", async (req, res) => {

  const { user_id, customer_name, product_name } = req.body;

  const { data, error } = await supabase
    .from("orders")
    .insert([
      {
        user_id,
        customer_name,
        product_name,
        status: "pending",
      },
    ])
    .select();

  if (error) {
    return res.status(500).json(error);
  }

  res.json(data);
});


// ======================
// GET ORDERS FOR CUSTOMER
// ======================

app.get("/orders/:username", async (req, res) => {

  const username = req.params.username;

  const { data, error } = await supabase
    .from("orders")
    .select("*")
    .eq("customer_name", username)
    .order("id", { ascending: false });

  if (error) {
    return res.status(500).json(error);
  }

  res.json(data);
});


// ======================
// GET ALL ORDERS (ADMIN)
// ======================

app.get("/orders", async (req, res) => {

  const { data, error } = await supabase
    .from("orders")
    .select("*")
    .order("id", { ascending: false });

  if (error) {
    return res.status(500).json(error);
  }

  res.json(data);
});


// ======================
// UPDATE STATUS
// ======================

app.put("/orders/:id", async (req, res) => {

  const id = req.params.id;

  const { status } = req.body;

  const { data, error } = await supabase
    .from("orders")
    .update({
      status,
      updated_at: new Date(),
    })
    .eq("id", id)
    .select();

  if (error) {
    return res.status(500).json(error);
  }

  res.json(data);
});


// ======================
// REALTIME LISTENER
// ======================

supabase
  .channel("orders-realtime")
  .on(
    "postgres_changes",
    {
      event: "*",
      schema: "public",
      table: "orders",
    },
    (payload) => {

      console.log("Realtime Change:", payload);

      const order = payload.new || payload.old;

      // send to correct customer only
      io.to(order.customer_name).emit(
        "order_update",
        payload
      );

      // send to admins
      io.emit("admin_order_update", payload);
    }
  )
  .subscribe();


// ======================

server.listen(process.env.PORT, () => {
  console.log(`Server running on ${process.env.PORT}`);
});