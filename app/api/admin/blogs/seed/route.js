import { NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import Blog from "@/models/Blog";
import { verifyBlogAdmin } from "@/lib/blogAuth";

const INITIAL_BLOGS = [
  {
    title: "Why Dirty Bedsheets Cause Acne and How Changing Them Weekly Rescues Your Skin",
    slug: "why-dirty-bedsheets-cause-acne-sleep-hygiene",
    excerpt: "Discover the dermatological connection between bedding hygiene, pillowcase bacterial buildup, and persistent facial breakouts.",
    category: "Sleep Hygiene",
    tags: ["skin-care", "acne-prevention", "hygiene", "clean-sheets", "dermatology"],
    coverImage: "https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?q=80&w=1200&auto=format&fit=crop",
    readTime: "5 min read",
    featured: true,
    views: 142,
    status: "published",
    author: {
      name: "Dr. Maya Sen",
      role: "Dermatological Hygiene Consultant",
      avatar: "/logo.png",
    },
    seoTitle: "How Dirty Bedsheets Cause Acne Breakouts | ClosetRush",
    seoDescription: "Pillowcases and sheets harbor sebum, sweat, and dead skin. Learn why washing or swapping bedsheets weekly prevents stubborn acne and skin irritation.",
    content: `
<h2>The Unseen Cause Behind Persistent Acne</h2>
<p>If you have invested hundreds of rupees in serums, chemical peels, and dermatological facials yet still wake up to stubborn breakouts on your cheeks and jawline, your skincare routine might not be the culprit. The answer is resting directly beneath your head every single night: <strong>your pillowcase and sheets</strong>.</p>

<blockquote style="border-left: 4px solid #05D4B5; padding: 16px 20px; background: #F0F6F6; font-style: italic; margin: 24px 0; border-radius: 4px;">
  "A standard pillowcase left unwashed for just 7 days harbors over 17,000 times more bacteria than a toilet seat. Night after night, your facial pores press into this concentrated bacterial reservoir for 8 continuous hours."
</blockquote>

<h2>How Bedding Becomes a Bacterial Incubator</h2>
<p>During the night, your body undergoes natural cellular rejuvenation. In the process, the skin sheds millions of dead epithelial cells, produces natural sebum, and exudes approximately 200ml to 500ml of nocturnal perspiration. Over just a few nights, these organic elements soak into pillow fabrics, creating the ideal warm, humid environment for <em>Cutibacterium acnes</em> and fungal spores to multiply.</p>

<h3>Three Signs Your Breakouts Are Bedding-Related</h3>
<ul>
  <li><strong>Unilateral Breakouts:</strong> Acne predominantly appearing on the side of your face you sleep on.</li>
  <li><strong>Morning Redness:</strong> Waking up with heightened skin flare-ups, itchiness, or minor pustules.</li>
  <li><strong>Back & Shoulder Acne ("Bacne"):</strong> Clogged pores along your upper back and shoulders from friction against stale sheets.</li>
</ul>

<h2>The Ideal Bedding Care Protocol for Clear Skin</h2>
<p>To break the cycle of sheet-induced breakouts, dermatologists recommend a strict regimen:</p>
<ol>
  <li><strong>Swap Pillowcases Every 3 to 4 Days:</strong> Because facial skin rests directly on pillow covers, rotating two pillowcases per week halves microbial contact.</li>
  <li><strong>Launder Sheets Weekly at 60°C+:</strong> Standard cold water rinses fail to dismantle hydrophobic body oils. Temperatures exceeding 60°C are required to dissolve sebum and eradicate dust mites.</li>
  <li><strong>Avoid Fragrant Fabric Softeners:</strong> Chemical softeners leave an invisible waxy residue over cotton fibers, which clogs pores when transferred to facial skin.</li>
  <li><strong>Upgrade to Organic 400 TC Cotton:</strong> Synthetic polyester sheets trap heat and sweat, creating friction and sweating. Pure breathable cotton allows skin to stay cool throughout sleep cycles.</li>
</ol>

<h2>Effortless Skin Hygiene with ClosetRush</h2>
<p>Living in high-density cities makes frequent large-scale laundry a weekend headache. With ClosetRush's ₹10/day bedding subscription, you receive crisp, freshly laundered 400 TC organic sheets and pillowcases delivered straight to your door every month. No heavy laundry, no drying hassles, and no compromised skin health.</p>
    `.trim(),
  },
  {
    title: "The Ultimate Thread Count Guide: Why 400 TC Organic Cotton is the Sweet Spot",
    slug: "ultimate-thread-count-guide-400-tc-organic-cotton",
    excerpt: "Debunking high thread count marketing myths: Why 400 TC long-staple cotton delivers the pinnacle of breathability, softness, and durability.",
    category: "Bedding Care",
    tags: ["thread-count", "organic-cotton", "fabric-science", "sleep-luxury", "linen-care"],
    coverImage: "https://images.unsplash.com/photo-1631679706909-1844bbd07221?q=80&w=1200&auto=format&fit=crop",
    readTime: "6 min read",
    featured: false,
    views: 98,
    status: "published",
    author: {
      name: "Aditya Rao",
      role: "Textile Sourcing & Quality Lead",
      avatar: "/logo.png",
    },
    seoTitle: "The Real Truth About Thread Count: Why 400 TC Cotton Wins",
    seoDescription: "Confused by 1000 TC sheet claims? Learn the textile science behind long-staple cotton and why 400 TC provides optimal breathability and luxury.",
    content: `
<h2>The Great Thread Count Myth</h2>
<p>For decades, department store bedding aisles have conditioned shoppers to believe that higher thread count automatically equals better luxury. Brands tout "1000 Thread Count" or even "1500 Thread Count" sheets with eye-watering price tags. But what does textile science actually say?</p>

<blockquote style="border-left: 4px solid #05D4B5; padding: 16px 20px; background: #F0F6F6; font-style: italic; margin: 24px 0; border-radius: 4px;">
  "In a single square inch of fabric, you can physically fit only about 400 to 500 strands of single-ply premium cotton thread. Any claim higher than that is achieved by twisting together multiple inferior, brittle fibers (multi-ply yarn)."
</blockquote>

<h2>Comparing Sheet Fabrics and Thread Counts</h2>
<p>To help you choose the best sheets for tropical and humid climates, here is how different thread counts compare across key sleep factors:</p>

<table style="width: 100%; border-collapse: collapse; margin: 24px 0; font-size: 14px; text-align: left;">
  <thead>
    <tr style="background-color: #032026; color: #FFFFFF;">
      <th style="padding: 12px 16px; border: 1px solid #1A4F54;">Thread Count</th>
      <th style="padding: 12px 16px; border: 1px solid #1A4F54;">Yarn Quality</th>
      <th style="padding: 12px 16px; border: 1px solid #1A4F54;">Breathability</th>
      <th style="padding: 12px 16px; border: 1px solid #1A4F54;">Verdict</th>
    </tr>
  </thead>
  <tbody>
    <tr style="background-color: #FAF9F6;">
      <td style="padding: 10px 16px; border: 1px solid #E2E8F0; font-weight: 600;">150 - 250 TC</td>
      <td style="padding: 10px 16px; border: 1px solid #E2E8F0;">Short staple, rough</td>
      <td style="padding: 10px 16px; border: 1px solid #E2E8F0;">High (loose weave)</td>
      <td style="padding: 10px 16px; border: 1px solid #E2E8F0; color: #dc2626;">Scratchy, pills easily</td>
    </tr>
    <tr style="background-color: #FFFFFF;">
      <td style="padding: 10px 16px; border: 1px solid #E2E8F0; font-weight: 600;">300 - 450 TC (Sweet Spot)</td>
      <td style="padding: 10px 16px; border: 1px solid #E2E8F0; color: #16a34a; font-weight: 600;">Long-staple single ply</td>
      <td style="padding: 10px 16px; border: 1px solid #E2E8F0; color: #16a34a; font-weight: 600;">Exceptional airflow</td>
      <td style="padding: 10px 16px; border: 1px solid #E2E8F0; color: #16a34a; font-weight: 600;">Silky soft, lasts 5+ years</td>
    </tr>
    <tr style="background-color: #FAF9F6;">
      <td style="padding: 10px 16px; border: 1px solid #E2E8F0; font-weight: 600;">800 - 1200 TC</td>
      <td style="padding: 10px 16px; border: 1px solid #E2E8F0;">Multi-ply twisted fibers</td>
      <td style="padding: 10px 16px; border: 1px solid #E2E8F0; color: #dc2626;">Very heavy, traps sweat</td>
      <td style="padding: 10px 16px; border: 1px solid #E2E8F0;">Overpriced, sleeps hot</td>
    </tr>
  </tbody>
</table>

<h2>Why 400 TC Long-Staple Cotton Outperforms the Rest</h2>
<p>At ClosetRush, we exclusively utilize 400-Thread Count Organic Long-Staple Cotton for our single and double bed linen collections. Here is why:</p>
<ul>
  <li><strong>Unmatched Air Permeability:</strong> Hot air and nighttime perspiration pass effortlessly through the weave, keeping you cool through warm summer nights.</li>
  <li><strong>Durable Tensile Strength:</strong> Long-staple fibers resist fraying and thinning even after repeated 60°C commercial sanitization cycles.</li>
  <li><strong>Softens with Every Wash:</strong> Unlike synthetic blends that stiffen over time, natural organic cotton fibers relax and get increasingly softer after each wash cycle.</li>
</ul>
    `.trim(),
  },
  {
    title: "The Economics of Renting vs. Buying Bedsheets for Urban Professionals",
    slug: "renting-vs-buying-bedsheets-economics-urban-professionals",
    excerpt: "A transparent breakdown of why renting clean hotel-grade sheets at ₹10 per day saves ₹8,500+ annually compared to purchasing and maintaining your own linens.",
    category: "Rental Lifestyle",
    tags: ["rental-economics", "urban-living", "smart-living", "sustainability", "bengaluru-rentals"],
    coverImage: "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?q=80&w=1200&auto=format&fit=crop",
    readTime: "4 min read",
    featured: false,
    views: 115,
    status: "published",
    author: {
      name: "Rohan Malhotra",
      role: "Lifestyle & Economics Editor",
      avatar: "/logo.png",
    },
    seoTitle: "Renting vs Buying Bedsheets: The Complete Cost Breakdown",
    seoDescription: "Calculate the real cost of owning bedsheets: detergents, electricity, upfront purchases, and laundry time versus seamless linen subscription at ₹10/day.",
    content: `
<h2>The Hidden Price of Sheet Ownership</h2>
<p>When young professionals move into new apartments, PGs, or co-living spaces across Bangalore, Hyderabad, or Pune, buying bedsheets feels like a mandatory expense. However, when you calculate upfront retail costs, wear and tear, electricity, premium detergents, and the precious weekend hours spent washing and ironing, the numbers tell a surprising story.</p>

<h2>Real Cost Breakdown Over 12 Months</h2>
<table style="width: 100%; border-collapse: collapse; margin: 24px 0; font-size: 14px; text-align: left;">
  <thead>
    <tr style="background-color: #032026; color: #FFFFFF;">
      <th style="padding: 12px 16px; border: 1px solid #1A4F54;">Expense Head</th>
      <th style="padding: 12px 16px; border: 1px solid #1A4F54;">Buying 3 Luxury Cotton Sets</th>
      <th style="padding: 12px 16px; border: 1px solid #1A4F54;">ClosetRush Subscription</th>
    </tr>
  </thead>
  <tbody>
    <tr style="background-color: #FAF9F6;">
      <td style="padding: 10px 16px; border: 1px solid #E2E8F0; font-weight: 600;">Upfront Purchase Cost</td>
      <td style="padding: 10px 16px; border: 1px solid #E2E8F0;">₹6,000 (3 sets @ ₹2,000 each)</td>
      <td style="padding: 10px 16px; border: 1px solid #E2E8F0; color: #16a34a; font-weight: 600;">₹0 (Zero deposit)</td>
    </tr>
    <tr style="background-color: #FFFFFF;">
      <td style="padding: 10px 16px; border: 1px solid #E2E8F0; font-weight: 600;">Laundry Detergent & Energy</td>
      <td style="padding: 10px 16px; border: 1px solid #E2E8F0;">₹1,800 / year</td>
      <td style="padding: 10px 16px; border: 1px solid #E2E8F0; color: #16a34a; font-weight: 600;">Included</td>
    </tr>
    <tr style="background-color: #FAF9F6;">
      <td style="padding: 10px 16px; border: 1px solid #E2E8F0; font-weight: 600;">Hot Sanitization (60°C)</td>
      <td style="padding: 10px 16px; border: 1px solid #E2E8F0;">Not possible in basic machines</td>
      <td style="padding: 10px 16px; border: 1px solid #E2E8F0; color: #16a34a; font-weight: 600;">Included on every swap</td>
    </tr>
    <tr style="background-color: #FFFFFF;">
      <td style="padding: 10px 16px; border: 1px solid #E2E8F0; font-weight: 600;">Total Yearly Cost</td>
      <td style="padding: 10px 16px; border: 1px solid #E2E8F0; font-weight: bold; color: #dc2626;">₹7,800 + 40 hrs of laundry</td>
      <td style="padding: 10px 16px; border: 1px solid #E2E8F0; font-weight: bold; color: #16a34a;">₹3,600 (₹10/day) + 0 hrs effort</td>
    </tr>
  </tbody>
</table>

<h2>Why Urban Living Demands Smarter Household Services</h2>
<p>Modern professionals happily stream music rather than buying CDs and rent workspaces rather than buying offices. Linen subscription is the logical next step for stress-free living:</p>
<ul>
  <li><strong>Free Delivery & Pickups:</strong> Fresh, sanitized sets delivered in sealed, hygienic packaging right to your door.</li>
  <li><strong>Pause or Cancel Anytime:</strong> Going home for holidays or switching apartments? Simply pause your subscription with one tap.</li>
  <li><strong>Always Hotel-Grade Quality:</strong> Never sleep on faded, pilled, or stained sheets again.</li>
</ul>
    `.trim(),
  },
];

export async function POST(request) {
  try {
    const auth = await verifyBlogAdmin(request);
    if (!auth) {
      return NextResponse.json(
        { success: false, error: "Unauthorized. Admin credentials or password required." },
        { status: 401 }
      );
    }

    await dbConnect();

    let createdCount = 0;
    for (const item of INITIAL_BLOGS) {
      const exists = await Blog.findOne({ slug: item.slug });
      if (!exists) {
        await Blog.create(item);
        createdCount++;
      }
    }

    return NextResponse.json({
      success: true,
      message: `Database seeded successfully. Inserted ${createdCount} new blog articles.`,
      count: createdCount,
    });
  } catch (error) {
    console.error("Blog Seeder Error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to seed blogs: " + error.message },
      { status: 500 }
    );
  }
}

export async function DELETE(request) {
  try {
    const auth = await verifyBlogAdmin(request);
    if (!auth) {
      return NextResponse.json(
        { success: false, error: "Unauthorized. Admin credentials or password required." },
        { status: 401 }
      );
    }

    await dbConnect();
    const slugs = INITIAL_BLOGS.map((b) => b.slug);
    const result = await Blog.deleteMany({ slug: { $in: slugs } });

    return NextResponse.json({
      success: true,
      message: `Removed ${result.deletedCount} mock demo articles from database.`,
      deletedCount: result.deletedCount,
    });
  } catch (error) {
    console.error("Blog Seeder DELETE Error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to remove mock blogs: " + error.message },
      { status: 500 }
    );
  }
}
