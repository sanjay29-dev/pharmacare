function PlaceholderPage({ title, description }) {
  return (
    <section className="placeholder-page">
      <div className="placeholder-icon">🚧</div>

      <h2>{title}</h2>

      <p>{description}</p>

      <span>Coming soon</span>
    </section>
  );
}

export default PlaceholderPage;