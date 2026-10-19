"""Builds the static pages with a shared header/footer. Run: python3 tools/build.py"""
import pathlib
ROOT = pathlib.Path(__file__).resolve().parent.parent
SITE = "https://platinum00001.github.io/cape-island-recovery/"
MISSION = ("Cape Island Recovery moves food and opens doors. Based in Falmouth, MA, we deliver meals and groceries "
           "to people in recovery and neighbors in need, and we connect people in recovery to the resources they need "
           "to rebuild: benefits, treatment, housing and meetings.")
LOGO = '<svg viewBox="0 0 64 64" aria-hidden="true"><circle cx="32" cy="32" r="30" fill="#f2a541"/><path d="M8 40c8-6 16-6 24 0s16 6 24 0v14H8z" fill="#0b3540"/><path d="M32 12c-6 6-8 12-8 16a8 8 0 0016 0c0-4-2-10-8-16z" fill="#fff"/></svg>'
ICO = {
 "food": '<svg viewBox="0 0 24 24" fill="none" stroke="#0f4c5c" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 7h13v9H3z"/><path d="M16 10h3l2 3v3h-5"/><circle cx="7" cy="18" r="2"/><circle cx="18" cy="18" r="2"/></svg>',
 "door": '<svg viewBox="0 0 24 24" fill="none" stroke="#0f4c5c" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 21h16"/><path d="M6 21V4h9l3 2v15"/><circle cx="13" cy="13" r="1"/></svg>',
 "car": '<svg viewBox="0 0 24 24" fill="none" stroke="#0f4c5c" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 16l1.5-5h11L19 16"/><path d="M3 16h18v3H3z"/><circle cx="7" cy="19" r="1.5"/><circle cx="17" cy="19" r="1.5"/></svg>',
}

def page(fname, title, desc, body, robots="index,follow"):
    url = SITE + ("" if fname == "index.html" else fname)
    html = f"""<!doctype html>
<html lang="en"><head>
<meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>{title}</title>
<meta name="description" content="{desc}"><meta name="robots" content="{robots}">
<link rel="canonical" href="{url}">
<meta property="og:type" content="website"><meta property="og:title" content="{title}">
<meta property="og:description" content="{desc}"><meta property="og:url" content="{url}">
<meta property="og:image" content="{SITE}og.jpg"><meta name="twitter:card" content="summary_large_image">
<link rel="icon" href="favicon.svg" type="image/svg+xml">
<link rel="stylesheet" href="css/style.css">
<script src="config.js"></script>
</head><body>
<a class="skip" href="#main">Skip to content</a>
<header class="top"><div class="wrap">
<a class="brand" href="./">{LOGO}<span>Cape Island Recovery</span></a>
<nav aria-label="Main"><a href="./#what">What we do</a><a href="./#get-help">Get help</a><a href="./#help">How to help</a><a href="./#contact">Contact</a><a href="account.html" id="acct-link">Create account</a></nav>
</div></header>
<main id="main">
{body}
</main>
<footer><div class="wrap">
<div><strong>Cape Island Recovery</strong> · Based in Falmouth, MA · 316 Gifford St, Falmouth, MA</div>
<div>A program of Inspiration Is Everywhere Inc., a 501(c)(3) nonprofit. EIN 82-5186366.</div>
<div>Sister programs: <a href="https://roottorisema.org">Root to Rise</a> · <a href="https://clubsforlove.com">Clubs for Love</a></div>
<div><a href="privacy.html">Privacy</a> · <a data-email href="#"></a> · <a data-phone href="#"></a></div>
<div>In crisis? Call or text <a href="tel:988">988</a> (Suicide &amp; Crisis Lifeline), any time. In an emergency, call 911.</div>
<div>© <span id="yr">2026</span> Inspiration Is Everywhere Inc.</div>
</div></footer>
<script src="js/app.js"></script>
</body></html>
"""
    (ROOT / fname).write_text(html)

INDEX = f"""
<section class="hero"><div class="wrap">
<span class="eyebrow">Based in Falmouth, MA · A program of Inspiration Is Everywhere</span>
<h1>Food on the table.<br>Doors open to recovery.</h1>
<p class="lead">Cape Island Recovery is the Falmouth, MA home of our nonprofit. We get food to people in recovery and neighbors in need, and we help people find the support they need to rebuild.</p>
<a class="btn primary" href="#get-help">Get help</a><a class="btn ghost" href="account.html">Create account</a><a class="btn ghost" data-donate href="#" target="_blank" rel="noopener">Donate</a>
</div></section>

<section id="mission"><div class="wrap">
<h2>Our mission</h2>
<p class="mission">{MISSION}</p>
<p>We meet people where they are, without judgment. Whether you're on day one or year ten, or you're a neighbor who's just having a hard month, you're welcome here.</p>
</div></section>

<section id="what" class="alt"><div class="wrap">
<h2>What we do</h2>
<div class="cards">
<article class="card"><div class="ico">{ICO['food']}</div><h3>Food transport</h3>
<p>We move food to people who need it: meals and groceries for people in recovery and neighbors in need, plus pick-ups from food donors and runs to and from local food pantries.</p></article>
<article class="card"><div class="ico">{ICO['door']}</div><h3>Resource connection</h3>
<p>We help people in recovery find and reach the right support: benefits like SNAP, MassHealth and fuel help, treatment options, housing, and recovery meetings. Check what you may qualify for with the free <a href="https://roottorisema.org/navigator/">Root to Rise benefits navigator</a>.</p></article>
<article class="card"><div class="ico">{ICO['car']}</div><span class="tag">Coming soon</span><h3>Rides</h3>
<p>We're planning rides to recovery meetings, medical appointments and jobs for people who can't drive. It isn't running yet. <a href="account.html">Create an account</a> and choose "Rides: tell me when this starts" to hear first.</p></article>
</div></div></section>

<section id="get-help"><div class="wrap">
<h2>How to get help</h2>
<ol class="steps">
<li><strong>Reach out.</strong> Call <a data-phone href="#"></a>, <a data-email href="#">email us</a>, or <a href="account.html">create a free account</a> and send a request.</li>
<li><strong>Tell us what you need.</strong> Food, help finding resources, or both. You don't have to explain your story, and you don't have to be in a program.</li>
<li><strong>We follow up privately,</strong> the way you asked us to (call, text or email).</li>
</ol>
<p class="note">Hours, delivery area and how often we deliver are coming soon. For now, call or send a request and we'll tell you what we can do.</p>
<div class="crisis"><strong>Need help right now?</strong> Call or text <a href="tel:988">988</a> any time. In an emergency, call 911.</div>
</div></section>

<section id="help" class="alt"><div class="wrap">
<h2>How to help</h2>
<div class="cards">
<article class="card"><h3>Donate</h3><p>Your gift keeps food moving and doors open in Falmouth.</p><a class="btn dark" data-donate href="#" target="_blank" rel="noopener">Donate</a><p class="note">Online giving is being set up. Want us to reach out when it opens? Leave a pledge below.</p></article>
<article class="card"><h3>Volunteer</h3><p>Drive food, pack groceries, or help someone find resources. <a href="account.html">Create an account</a> and choose "I want to volunteer."</p><a class="btn dark" href="account.html">Volunteer</a></article>
<article class="card"><h3>Give food or partner with us</h3><p>Restaurants, farms, grocers and pantries: if you have food to share or need help moving it, call <a data-phone href="#"></a> or <a data-email href="#">email us</a>.</p></article>
</div>
<form id="pledge-form" class="card" style="margin-top:24px;max-width:640px">
<h3>Pledge a gift (no payment taken)</h3>
<label>Name (optional)<input name="name" autocomplete="name" maxlength="120"></label>
<label>Email<input name="email" type="email" autocomplete="email" required maxlength="200"></label>
<label>I'd like to give<select name="pledge_type"><option value="money">Money</option><option value="food">Food</option><option value="time">My time</option><option value="other">Something else</option></select></label>
<label>Message (optional)<textarea name="message" rows="3" maxlength="1000"></textarea></label>
<button class="btn primary" type="submit">Send pledge</button>
<p class="note" id="pledge-msg" role="status"></p>
</form>
</div></section>

<section class="donate-band"><div class="wrap">
<h2>Help us keep food moving in Falmouth</h2>
<a class="btn primary" data-donate href="#" target="_blank" rel="noopener">Donate</a><a class="btn dark" href="account.html" style="background:#fff;color:#0f4c5c">Create account</a>
</div></section>

<section id="contact"><div class="wrap">
<h2>Contact</h2>
<div class="contact-grid">
<div class="card"><h3>Call or text</h3><a data-phone href="#"></a></div>
<div class="card"><h3>Email</h3><a data-email href="#"></a></div>
<div class="card"><h3>Visit</h3><p>316 Gifford St<br>Falmouth, MA<br><span class="note">Visiting hours coming soon. Please call first.</span></p></div>
</div>
<p class="sisters" style="margin-top:24px">Part of the same family: <a href="https://roottorisema.org">Root to Rise</a> (recovery community, coaching and the benefits navigator) and <a href="https://clubsforlove.com">Clubs for Love</a> (donated golf clubs for people in recovery).</p>
</div></section>
"""

ACCOUNT = """
<section class="hero" style="padding:48px 0 64px"><div class="wrap">
<span class="eyebrow">Based in Falmouth, MA</span>
<h1 style="font-size:clamp(30px,5vw,44px)">Your Cape Island Recovery account</h1>
<p class="lead">Free and private. Ask for food or resource help, sign up to volunteer, and see the status of your requests.</p>
</div></section>
<section><div class="wrap"><div id="account-area"><p class="note">Loading…</p></div></div></section>
"""

PRIVACY = """
<section><div class="wrap prose">
<h1 style="color:#0f4c5c">Privacy policy</h1>
<p class="note">Last updated October 19, 2026</p>
<p>Cape Island Recovery is a program of Inspiration Is Everywhere Inc., a 501(c)(3) nonprofit based in Falmouth, MA. Privacy and anonymity matter in recovery. This page explains what we collect and how we protect it.</p>
<h2>What we collect</h2>
<ul>
<li><strong>Account:</strong> your email address and password (stored securely by our database provider; we can't see your password).</li>
<li><strong>Requests and volunteer sign-ups:</strong> what you ask for, your town, how you'd like to be contacted, a phone number if you give one, and any note you add.</li>
<li><strong>Pledges:</strong> your email, optional name, what you'd like to give and any message.</li>
</ul>
<p>Please don't send medical or treatment details through the site. We'll talk privately.</p>
<h2>How we use it</h2>
<p>Only to respond to you, deliver food, connect you to resources, coordinate volunteers and follow up on pledges. We never sell, rent or publish your information, and we never post about anyone we serve without their written permission.</p>
<h2>Who can see it</h2>
<p>You can see your own requests when signed in. A small number of authorized team members can see requests so they can help. Access is enforced by database security rules. With your permission, we may share what's needed with a partner (for example, a food pantry) to get you help.</p>
<h2>Where it's stored</h2>
<p>Data is stored with Supabase (database and sign-in). The site is hosted on GitHub Pages. We don't use advertising trackers.</p>
<h2 id="data-deletion">Deleting your data</h2>
<p>Signed in? Use "Delete all my data from this site" on your <a href="account.html">account page</a>. Or email <a data-email href="#"></a> and we'll delete your information and your login.</p>
<h2>Crisis</h2>
<p>This site is not for emergencies. Call or text <a href="tel:988">988</a>, or call 911.</p>
<h2>Contact</h2>
<p><a data-email href="#"></a> · <a data-phone href="#"></a> · 316 Gifford St, Falmouth, MA</p>
</div></section>
"""

NOTFOUND = """<section><div class="wrap"><h1 style="color:#0f4c5c">Page not found</h1><p><a href="./">Back to Cape Island Recovery</a></p></div></section>"""

DESC = "Cape Island Recovery, based in Falmouth, MA: food transport for people in recovery and neighbors in need, and connection to benefits, treatment, housing and meetings. A program of Inspiration Is Everywhere Inc."
page("index.html", "Cape Island Recovery | Falmouth, MA", DESC, INDEX)
page("account.html", "My account | Cape Island Recovery", "Create a free, private account to request food or resource help or volunteer with Cape Island Recovery in Falmouth, MA.", ACCOUNT)
page("privacy.html", "Privacy | Cape Island Recovery", "How Cape Island Recovery protects your privacy and anonymity.", PRIVACY)
page("404.html", "Not found | Cape Island Recovery", DESC, NOTFOUND, robots="noindex")
(ROOT / "robots.txt").write_text(f"User-agent: *\nAllow: /\nSitemap: {SITE}sitemap.xml\n")
(ROOT / "sitemap.xml").write_text('<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">' + "".join(f"<url><loc>{SITE}{p}</loc></url>" for p in ["", "account.html", "privacy.html"]) + "</urlset>\n")
(ROOT / ".nojekyll").write_text("")
print("built")
