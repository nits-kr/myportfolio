const API_URL = "http://localhost:5000/api";
const BLOG_API_URL = `${API_URL}/blogs`;

async function verifyBlogApi() {
  console.log("Starting Blog API Verification...");

  try {
    // 1. Get All Blogs (Public)
    console.log("\n--- Testing GET /api/blogs ---");
    const getResponse = await fetch(BLOG_API_URL);
    const getData = await getResponse.json();

    console.log("Status:", getResponse.status);
    console.log("Count:", getData.count);

    if (getResponse.ok) {
      console.log("Success: Public list fetched.");
    } else {
      console.error("Failed to fetch public list:", getData);
    }

    // 2. Get Single Blog (if any exist)
    if (getData.data && getData.data.length > 0) {
      const blogId = getData.data[0]._id;
      console.log(`\n--- Testing GET /api/blogs/${blogId} ---`);
      const getSingleResponse = await fetch(`${BLOG_API_URL}/${blogId}`);
      const getSingleData = await getSingleResponse.json();

      console.log("Status:", getSingleResponse.status);
      console.log("Title:", getSingleData.data.title);

      if (getSingleResponse.ok) {
        console.log("Success: Single blog fetched.");
      } else {
        console.error("Failed to fetch single blog:", getSingleData);
      }
    } else {
      console.log("Skipping single blog test (no blogs found).");
    }

    // Note: detailed CRUD tests require authentication.
    console.log(
      "\n*** Automated verification limited to public endpoints. ***",
    );
    console.log(
      "*** Please perform manual verification for Admin operations (Create, Update, Delete). ***",
    );
  } catch (error) {
    console.error("Verification Failed:", error.message);
  }
}

verifyBlogApi();
