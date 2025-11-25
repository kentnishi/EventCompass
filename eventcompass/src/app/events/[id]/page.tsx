export default function EventDetails({ params }: { params: { id: string } }) {
    return (
        <div style={{ textAlign: "center", padding: "50px" }}>
            <h1 style={{ fontSize: "2rem", color: "#333" }}>Event Not Found</h1>
            <p style={{ fontSize: "1.2rem", color: "#666" }}>
                The event you are looking for does not exist or the ID is missing.
            </p>
        </div>
    );
}
