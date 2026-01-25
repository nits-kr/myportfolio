import Hero from "@/components/features/Hero";

export default function Home() {
  return (
    <>
      <Hero />
      <section className="container py-5">
        <div className="text-center mb-5">
          <h2 className="fw-bold fs-1">Why Choose Me?</h2>
          <p className="subtext">Delivering excellence in every project</p>
        </div>
        <div className="row g-4">
          {[
            {
              title: "Modern Design",
              desc: "Clean, aesthetic, and user-centric interfaces using Glassmorphism.",
              icon: "🎨",
            },
            {
              title: "High Performance",
              desc: "Optimized for speed and SEO using Next.js best practices.",
              icon: "⚡",
            },
            {
              title: "Scalable Code",
              desc: "Maintainable architecture with React & Redux Toolkit.",
              icon: "🛠️",
            },
          ].map((item, idx) => (
            <div key={idx} className="col-md-4">
              <div className="glass-card h-100 text-center">
                <div className="display-4 mb-3">{item.icon}</div>
                <h3 className="h4 fw-bold">{item.title}</h3>
                <p>{item.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>
    </>
  );
}
