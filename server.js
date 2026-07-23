require("dotenv").config();

const express = require("express");
const cors = require("cors");
const { createClient } = require("@supabase/supabase-js");

const app = express();

app.use(cors());
app.use(express.json());

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

app.get("/", (req, res) => {
  res.send("API Flexi Activation OK");
});

app.get("/api/orders", async (req, res) => {
  try {
    const { data, error } = await supabase
      .from("activation_requests")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      return res.status(500).json(error);
    }

    res.json(data);
  } catch (err) {
    res.status(500).json({
      message: err.message,
    });
  }
});

app.post("/webhooks/chariow", async (req, res) => {
  try {
    console.log(JSON.stringify(req.body, null, 2));
    const payload = req.body || {};
    const event = payload.event;

    if (event === "successful.sale") {
      const saleId = payload.sale && payload.sale.id ? String(payload.sale.id) : null;
      const customerPhone = payload.customer && payload.customer.phone ? String(payload.customer.phone) : null;
      const productName = payload.product && payload.product.name ? String(payload.product.name) : null;

      if (saleId && customerPhone && productName) {
        const { data: match, error: findError } = await supabase
          .from("activation_requests")
          .select("id")
          .eq("phone", customerPhone)
          .eq("service", productName)
          .order("created_at", { ascending: false })
          .limit(1)
          .maybeSingle();

        if (findError) {
          console.error("Erreur recherche webhook chariow:", findError.message);
        } else if (match && match.id) {
          const { error: updateError } = await supabase
            .from("activation_requests")
            .update({
              payment_status: "paid",
              status: "completed",
              payment_reference: saleId,
            })
            .eq("id", match.id);

          if (updateError) {
            console.error("Erreur mise a jour webhook chariow:", updateError.message);
          }
        }
      }
    }
  } catch (err) {
    console.error("Erreur webhook chariow:", err.message);
  }

  return res.status(200).send("OK");
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Serveur lancé sur http://localhost:${PORT}`);
});