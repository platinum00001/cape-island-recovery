/* Cape Island Recovery — Supabase auth + forms. Falls back to email when online saving is off. */
(function () {
  const cfg = () => window.CIR_CONFIG || {};
  const CDN = "https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2.118.0/dist/umd/supabase.js";
  const $ = (s, r) => (r || document).querySelector(s);
  const esc = (s) => String(s == null ? "" : s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  const KIND = { food_delivery: "Food delivery", resource_connection: "Resource connection", ride_interest: "Rides (future service)", volunteer: "Volunteer sign-up" };
  const STATUS = { new: "Received", contacted: "We reached out", in_progress: "In progress", done: "Done", closed: "Closed" };
  let sbPromise = null;

  function getSb() {
    if (sbPromise) return sbPromise;
    const c = cfg();
    if (!c.SUPABASE_URL || !c.SUPABASE_ANON_KEY) return (sbPromise = Promise.resolve(null));
    sbPromise = new Promise((resolve) => {
      const s = document.createElement("script");
      s.src = CDN; s.crossOrigin = "anonymous";
      s.onload = () => { try { resolve(window.supabase.createClient(c.SUPABASE_URL, c.SUPABASE_ANON_KEY, { db: { schema: c.SUPABASE_SCHEMA }, auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true } })); } catch (e) { resolve(null); } };
      s.onerror = () => resolve(null);
      document.head.appendChild(s);
    });
    return sbPromise;
  }
  const schemaOff = (e) => e && /PGRST106|Invalid schema/i.test(String(e.message || "") + String(e.code || ""));
  function friendly(e) {
    if (!e) return "";
    const m = String(e.message || e);
    if (schemaOff(e)) return "Online saving is being switched on. Please use the email link for now.";
    if (/rate limit|too many/i.test(m)) return "Too many tries. Please wait a few minutes, or call us.";
    if (/Invalid login credentials/i.test(m)) return "That email and password don't match. Try the email link instead.";
    if (/Email not confirmed/i.test(m)) return "Please confirm your email first (check your inbox).";
    if (/Failed to fetch|NetworkError/i.test(m)) return "We couldn't reach the server. Check your connection and try again.";
    return m;
  }
  function mailto(subject, body) {
    return "mailto:" + cfg().CONTACT_EMAIL + "?subject=" + encodeURIComponent(subject) + "&body=" + encodeURIComponent(body);
  }
  const pageURL = (p) => new URL(p, location.href).href.split("#")[0].split("?")[0];

  // Fill contact placeholders everywhere.
  document.querySelectorAll("[data-email]").forEach((a) => { a.href = "mailto:" + cfg().CONTACT_EMAIL; if (!a.textContent.trim()) a.textContent = cfg().CONTACT_EMAIL; });
  document.querySelectorAll("[data-phone]").forEach((a) => { a.href = "tel:+1" + cfg().PHONE.replace(/\D/g, ""); if (!a.textContent.trim()) a.textContent = cfg().PHONE; });
  document.querySelectorAll("[data-donate]").forEach((a) => { a.href = cfg().DONATE_URL; });
  const yr = $("#yr"); if (yr) yr.textContent = new Date().getFullYear();

  // Header: show "My account" when signed in.
  getSb().then(async (sb) => {
    if (!sb) return;
    const { data } = await sb.auth.getSession();
    const link = $("#acct-link");
    if (link && data && data.session) link.textContent = "My account";
  });

  // ---------- Pledge form (public, no account needed) ----------
  const pf = $("#pledge-form");
  if (pf) pf.addEventListener("submit", async (ev) => {
    ev.preventDefault();
    const msg = $("#pledge-msg");
    const row = { name: pf.name.value.trim() || null, email: pf.email.value.trim(), pledge_type: pf.pledge_type.value, message: pf.message.value.trim() || null };
    msg.textContent = "Sending…";
    const sb = await getSb();
    let err = !sb ? { message: "Failed to fetch" } : null;
    if (sb) {
      const { data } = await sb.auth.getSession();
      if (data && data.session) row.user_id = data.session.user.id;
      ({ error: err } = await sb.from("pledges").insert(row));
    }
    if (!err) { pf.reset(); msg.innerHTML = "Thank you! We'll be in touch when online giving opens."; return; }
    msg.innerHTML = esc(friendly(err)) + ' <a href="' + esc(mailto("Pledge to Cape Island Recovery", "Name: " + (row.name || "") + "\nI'd like to give: " + row.pledge_type + "\n" + (row.message || ""))) + '">Email your pledge instead</a>';
  });

  // ---------- Account page ----------
  const area = $("#account-area");
  if (!area) return;
  const urlErr = (() => {
    const h = new URLSearchParams(location.hash.replace(/^#/, "")), q = new URLSearchParams(location.search);
    const d = h.get("error_description") || q.get("error_description");
    if (d) history.replaceState(null, "", location.pathname);
    return d ? (/expired|invalid/i.test(d) ? "That sign-in link has expired or was already used. Please request a new one." : d.replace(/\+/g, " ")) : "";
  })();

  async function render() {
    const sb = await getSb();
    if (!sb) { area.innerHTML = '<p class="notice">Accounts are offline right now. Please <a data-email>email us</a> or call <a data-phone></a>.</p>'; return; }
    const { data } = await sb.auth.getSession();
    if (data && data.session) return renderMember(sb, data.session.user);
    renderAuth(sb);
  }

  function renderAuth(sb, notice) {
    area.innerHTML =
      (notice || urlErr ? '<p class="notice" role="alert">' + esc(notice || urlErr) + "</p>" : "") +
      '<div class="cards">' +
      '<form id="signup" class="card"><h3>Create a free account</h3>' +
      '<label>Email<input name="email" type="email" autocomplete="email" required></label>' +
      '<label>Password (8+ characters)<input name="pass" type="password" minlength="8" autocomplete="new-password" required></label>' +
      '<label class="check"><input type="checkbox" required> I agree to the <a href="privacy.html">privacy policy</a>.</label>' +
      '<button class="btn primary" type="submit">Create account</button><p class="note" role="status"></p></form>' +
      '<form id="signin" class="card"><h3>Sign in</h3>' +
      '<label>Email<input name="email" type="email" autocomplete="email" required></label>' +
      '<label>Password<input name="pass" type="password" autocomplete="current-password" required></label>' +
      '<button class="btn primary" type="submit">Sign in</button> <button class="linklike" type="button" id="forgot">Forgot password?</button><p class="note" role="status"></p></form>' +
      '<form id="magic" class="card"><h3>No password? Get an email link</h3>' +
      '<label>Email<input name="email" type="email" autocomplete="email" required></label>' +
      '<button class="btn primary" type="submit">Email me a sign-in link</button><p class="note" role="status"></p>' +
      '<p class="note">New here? The link creates your account.</p></form></div>' +
      '<p class="note">Your account is private. We never post, share or sell your information. Prefer not to make an account? Call <a data-phone></a> or <a data-email>email us</a>.</p>';
    fillContacts();
    const redirect = pageURL("account.html");
    const out = (f, t) => { f.querySelector('[role="status"]').textContent = t; };
    $("#signup").addEventListener("submit", async (e) => {
      e.preventDefault(); const f = e.target; out(f, "Creating…");
      const { data, error } = await sb.auth.signUp({ email: f.email.value.trim(), password: f.pass.value, options: { emailRedirectTo: redirect } });
      if (error) return out(f, friendly(error));
      if (data.session) return render();
      out(f, "Check your email to confirm your account, then come back here.");
    });
    $("#signin").addEventListener("submit", async (e) => {
      e.preventDefault(); const f = e.target; out(f, "Signing in…");
      const { error } = await sb.auth.signInWithPassword({ email: f.email.value.trim(), password: f.pass.value });
      if (error) return out(f, friendly(error)); render();
    });
    $("#forgot").addEventListener("click", async () => {
      const f = $("#signin"); const em = f.email.value.trim();
      if (!em) return out(f, "Type your email above first.");
      const { error } = await sb.auth.resetPasswordForEmail(em, { redirectTo: redirect });
      out(f, error ? friendly(error) : "If that email has an account, a reset link is on its way.");
    });
    $("#magic").addEventListener("submit", async (e) => {
      e.preventDefault(); const f = e.target; out(f, "Sending…");
      const { error } = await sb.auth.signInWithOtp({ email: f.email.value.trim(), options: { emailRedirectTo: redirect } });
      out(f, error ? friendly(error) : "Check your email for your sign-in link.");
    });
  }

  function fillContacts() {
    area.querySelectorAll("[data-email]").forEach((a) => { a.href = "mailto:" + cfg().CONTACT_EMAIL; if (!a.textContent.trim()) a.textContent = cfg().CONTACT_EMAIL; });
    area.querySelectorAll("[data-phone]").forEach((a) => { a.href = "tel:+1" + cfg().PHONE.replace(/\D/g, ""); if (!a.textContent.trim()) a.textContent = cfg().PHONE; });
  }

  async function renderMember(sb, user) {
    const recovery = /type=recovery/.test(location.hash);
    area.innerHTML =
      '<p>Signed in as <strong>' + esc(user.email) + '</strong>. <button class="linklike" id="signout" type="button">Sign out</button></p>' +
      (recovery ? '<form id="newpass" class="card"><h3>Set a new password</h3><label>New password<input name="pass" type="password" minlength="8" required></label><button class="btn primary">Save</button><p class="note" role="status"></p></form>' : "") +
      '<div class="cards">' +
      '<form id="req" class="card"><h3>Ask for help or volunteer</h3>' +
      '<label>What do you need?<select name="kind" required>' +
      '<option value="food_delivery">Food delivery (meals or groceries)</option>' +
      '<option value="resource_connection">Connect me to resources</option>' +
      '<option value="volunteer">I want to volunteer</option>' +
      '<option value="ride_interest">Rides: tell me when this starts</option></select></label>' +
      '<fieldset id="topics"><legend>Resources (optional)</legend>' +
      ["Benefits (SNAP, MassHealth, fuel help)", "Treatment options", "Housing", "Meetings", "Jobs", "Other"].map((t) => '<label class="check"><input type="checkbox" value="' + esc(t) + '"> ' + esc(t) + "</label>").join("") + "</fieldset>" +
      '<label>Town<input name="town" autocomplete="address-level2" maxlength="80" placeholder="e.g. Falmouth"></label>' +
      '<label>Anything we should know? (optional)<textarea name="details" maxlength="2000" rows="4" placeholder="Please don\'t include medical details. We\'ll talk privately."></textarea></label>' +
      '<label>Best way to reach you<select name="contact_pref"><option value="email">Email</option><option value="phone">Phone call</option><option value="text">Text</option></select></label>' +
      '<label>Phone (if call or text)<input name="phone" type="tel" autocomplete="tel" maxlength="30"></label>' +
      '<button class="btn primary" type="submit">Send request</button><p class="note" role="status"></p></form>' +
      '<section class="card"><h3>My requests</h3><div id="mine"><p class="note">Loading…</p></div>' +
      '<p class="note">Only you (and our small team) can see these.</p>' +
      '<button class="linklike" id="delete-data" type="button">Delete all my data from this site</button></section></div>';
    $("#signout").addEventListener("click", async () => { await sb.auth.signOut(); render(); });
    const np = $("#newpass");
    if (np) np.addEventListener("submit", async (e) => { e.preventDefault(); const { error } = await sb.auth.updateUser({ password: np.pass.value }); np.querySelector('[role="status"]').textContent = error ? friendly(error) : "Password saved."; if (!error) history.replaceState(null, "", location.pathname); });
    const f = $("#req");
    f.addEventListener("submit", async (e) => {
      e.preventDefault(); const st = f.querySelector('[role="status"]'); st.textContent = "Sending…";
      const row = { kind: f.kind.value, topics: [...f.querySelectorAll("#topics input:checked")].map((i) => i.value), town: f.town.value.trim() || null, details: f.details.value.trim() || null, contact_pref: f.contact_pref.value, phone: f.phone.value.trim() || null };
      const { error } = await sb.from("requests").insert(row);
      if (!error) { f.reset(); st.textContent = "Got it. We'll reach out the way you asked."; return loadMine(sb); }
      st.innerHTML = esc(friendly(error)) + ' <a href="' + esc(mailto("Cape Island Recovery: " + KIND[row.kind], "Request: " + KIND[row.kind] + "\nResources: " + row.topics.join(", ") + "\nTown: " + (row.town || "") + "\nBest way to reach me: " + row.contact_pref + " " + (row.phone || "") + "\n\n" + (row.details || ""))) + '">Send by email instead</a>';
    });
    $("#delete-data").addEventListener("click", async () => {
      if (!confirm("Delete all your requests, pledges and profile from Cape Island Recovery? This can't be undone.")) return;
      const { error } = await sb.rpc("delete_my_data");
      alert(error ? friendly(error) : "Your data was deleted. To close your login completely, email us.");
      loadMine(sb);
    });
    loadMine(sb);
  }

  async function loadMine(sb) {
    const box = $("#mine"); if (!box) return;
    const { data, error } = await sb.from("requests").select("id,kind,topics,status,created_at").order("created_at", { ascending: false }).limit(50);
    if (error) { box.innerHTML = '<p class="note">' + esc(friendly(error)) + "</p>"; return; }
    box.innerHTML = data.length ? "<ul class='mine'>" + data.map((r) => "<li><strong>" + esc(KIND[r.kind] || r.kind) + "</strong> · " + esc(new Date(r.created_at).toLocaleDateString()) + " · <span class='tag'>" + esc(STATUS[r.status] || r.status) + "</span>" + (r.topics && r.topics.length ? "<br><span class='note'>" + esc(r.topics.join(", ")) + "</span>" : "") + "</li>").join("") + "</ul>" : '<p class="note">No requests yet.</p>';
  }
  render();
})();
