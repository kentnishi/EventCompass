"use client";

import React from "react";
import styles from "../css/CompassChat.module.css";
import PersonIcon from "@mui/icons-material/Person";
import { supabase } from "../../lib/supabase";

//temp data
// const eventData = {
//     description: {
//         attendees: 150,
//         text: "Describing things is my passion. A passion for descriptions. That is something that I enjoy. Try including goals and things you want out of your event (like target audience...)",
//     },
//     dateTime: {
//         startDate: "09/18/2025",
//         endDate: "09/18/2025",
//         startTime: "5:00 PM",
//         endTime: "7:00 PM",
//     },
//     budgetLocation: {
//         budget: "$3000",
//         spending: "$2000",
//         location: "Your Mom's Room",
//     },
//     sections: [
//         {
//             vendors: [
//                 { title: "Ice or Rice", price: "$1500" },
//                 { title: "Costco", price: "$150" },
//             ],
//         },
//         {   //in actual api call, include desc for additional info, for ref and is not shown on the chat
//             logistics: [{ title: "Craft", price: "$40" }, { title: "Craft", price: "$40" }, { title: "Craft", price: "$40" }, { title: "Craft", price: "$40" }],
//         },
//         {
//             giveaways: [{ title: "Plushie", price: "$15" }],
//         },
//     ],
// };





function EventInput({
    label,
    value,
    placeholder,
    className,
    isTextArea = false,
}: {
    label: string;
    value?: string;
    placeholder?: string;
    className?: string;
    isTextArea?: boolean;
}) {
    return (
        <div
            className={`${styles.eventInputBox} ${className}`}
            style={{ flexGrow: 1, minWidth: "0" }}
        >
            <label
                className={styles.inputLabel}
                style={{
                    fontSize: "1rem",
                    fontWeight: 700,
                    color: "#4a5676",
                    marginBottom: "4px",
                    display: "block",
                }}
            >
                {label}
            </label>
            {isTextArea ? (
                <textarea
                    defaultValue={value}
                    placeholder={placeholder}
                    className={styles.inputValue}
                    rows={4}
                    style={{
                        width: "100%",
                        padding: "10px",
                        borderRadius: "4px",
                        border: "1px solid #ddd",
                        resize: "vertical",
                        color: "#4a5676",
                        fontSize: "1rem",
                        fontWeight: 700,
                    }}
                />
            ) : (
                <input
                    type="text"
                    defaultValue={value}
                    placeholder={placeholder}
                    className={styles.inputValue}
                    style={{
                        width: "100%",
                        padding: "10px",
                        borderRadius: "4px",
                        border: "1px solid #ddd",
                        color: "#4a5676",         
                        fontSize: "1rem",         
                        fontWeight: 700,        
                    }}
                />
            )}
        </div>
    );
}

function EventInputPair({
    label1,
    value1,
    label2,
    value2,
}: {
    label1: string;
    value1: string;
    label2: string;
    value2: string;
}) {
    return (
        <div
            className={styles.inputRow}
            style={{ display: "flex", gap: "20px", marginBottom: "15px" }}
        >
            <EventInput label={label1} value={value1} className={styles.inputSmall} />
            <EventInput label={label2} value={value2} className={styles.inputSmall} />
        </div>
    );
}

function EventListItem({ title, price }: { title: string; price: string }) {
    return (
        <div
            className={styles.eventListItem}
            style={{
                display: "flex",
                flexDirection: "column",      
                justifyContent: "center",
                alignItems: "center",
                backgroundColor: "#F7F7F7",
                padding: "10px 12px",
                borderRadius: "8px",
                fontWeight: 700,
                fontSize: "1rem",
                color: "#4a5676",
                boxSizing: "border-box",
                flex: "1 1 120px",
                minWidth: "120px",
                maxWidth: "120px",
                height: "60px",               
                textAlign: "center",          
            }}
        >
            <span style={{ fontSize: "1rem", fontWeight: 700, color: "#4a5676" }}>
                {title}
            </span>
            <span
                style={{
                    fontSize: "0.95rem",
                    fontWeight: 700,
                    color: "#4caf50",
                    marginTop: "4px",         
                }}
            >
                {price}
            </span>
        </div>
    );
}





export default function EventColumn() {
    const [eventData, setEventData] = React.useState<any>(null);
    const [loading, setLoading] = React.useState(true);
    const [error, setError] = React.useState<string | null>(null);
    const eventId = "e6c1118f-facf-4ca8-beea-bb965c433bda";
    type EventItem = { title: string; price: string };
    type Section = Record<string, EventItem[]>; // e.g. { vendors: EventItem[] }


    React.useEffect(() => {
        async function fetchEvent() {
            try {
                console.log("Event ID:", eventId);
                setLoading(true);
                // Fetch the first event (you can change this to filter or pass an ID later)
                
                const { data: event, error: eventError } = await supabase
                    .from("events")
                    .select("*")
                    .eq("id", eventId)
                    .single();

                if (eventError) throw eventError;
                if (!event) throw new Error(`No event found with ID ${eventId}`);
                console.log("Fetched event:", event);


                // Fetch all items related to that event
                const { data: items, error: itemsError } = await supabase
                    .from("event_items")
                    .select("*")
                    .eq("event_id", event.id);

                if (itemsError) throw itemsError;

                // Transform data into the same structure your component expects
                const grouped = items.reduce((acc: any, item: any) => {
                    const sectionName = item.item_type + "s"; // vendor → vendors
                    acc[sectionName] = acc[sectionName] || [];
                    acc[sectionName].push({
                        title: item.name,
                        price: `$${item.price}`,
                    });
                    return acc;
                }, {});

                const formattedData = {
                    description: {
                        attendees: event.attendees || 0,
                        text: event.description || "No description yet.",
                    },
                    dateTime: {
                        startDate: event.start_date,
                        endDate: event.end_date,
                        startTime: event.start_time,
                        endTime: event.end_time,
                    },
                    budgetLocation: {
                        budget: `$${event.budget || 0}`,
                        spending: `$${event.spending || 0}`,
                        location: event.location || "TBD",
                    },
                    sections: Object.entries(grouped).map(([key, value]) => ({
                        [key]: value,
                    })),
                };

                setEventData(formattedData);
            } catch (err: any) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        }

        fetchEvent();
    }, []);

    if (loading) return <div>Loading event data...</div>;
    if (error) return <div style={{ color: "red" }}>Error: {error}</div>;
    if (!eventData) return <div>No event found.</div>;

    const { description, dateTime, budgetLocation, sections } = eventData;


    return (
        <section
            className={styles.eventCol}
            style={{
                padding: "10px 30px",
                backgroundColor: '#d5dcf1',
                borderRadius: "8px",
                boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                overflowY: "auto",
                height: "100%",
                marginBottom: '20px'
            }}
        >
            {/* Event Description */}
            <div className={styles.section} style={{ marginBottom: "25px" }}>
                <div
                    className={styles.sectionHeader}
                    style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        marginBottom: "10px",
                    }}
                >
                    <h3 style={{ fontSize: "1.2rem", fontWeight: 600, color: "#333" }}>
                        Event Details
                    </h3>
                    <div
                        className={styles.audienceBadge}
                        style={{
                            display: "flex",
                            alignItems: "center",
                            justifyContent:"center",
                            color: "#888",
                            fontSize: "0.9rem",
                            backgroundColor: "#FFF",
                            borderRadius: '12px',
                            padding: '4px',
                            width: '75px',
                        }}
                    >
                        <PersonIcon style={{ fontSize: "1rem", marginRight: "4px" }} />
                        <span>{description.attendees}</span>
                    </div>
                </div>
                <EventInput
                    label="Event Description"
                    value={description.text}
                    isTextArea
                    className={styles.descriptionTextarea}
                />
            </div>

            {/* Date & Time */}
            <div className={styles.section} style={{ marginBottom: "18px" }}>  
                <EventInputPair
                    label1="Start Date"
                    value1={dateTime.startDate}
                    label2="End Date"
                    value2={dateTime.endDate}
                />
                <EventInputPair
                    label1="Start Time"
                    value1={dateTime.startTime}
                    label2="End Time"
                    value2={dateTime.endTime}
                />
            </div>

            {/* Budget & Location */}
            <div className={styles.section} style={{ marginBottom: "15px" }}>  
                <EventInputPair
                    label1="Budget"
                    value1={budgetLocation.budget}
                    label2="Spending"
                    value2={budgetLocation.spending}
                />
                <EventInput label="Location" value={budgetLocation.location} />
            </div>


            {/* Dynamic Sections (Vendors, Activities, etc.) */}
            {sections.map((section: Section, i: number) => {
                const [key, items] = Object.entries(section)[0];
                const title = key.charAt(0).toUpperCase() + key.slice(1);

                return (
                    <div key={title} className={styles.section} style={{ marginBottom: i === sections.length - 1 ? "0px" : "15px" }}>
                        <h3
                            style={{
                                fontSize: "1rem",
                                fontWeight: 700,
                                color: "#4a5676",
                                marginBottom: "4px",
                            }}
                        >
                            {title}
                        </h3>

                        <div className={styles.inputRow} style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
                            {items.map((item: EventItem, index: number) => (
                                <EventListItem key={index} title={item.title} price={item.price} />
                            ))}

                            <button
                                className={styles.addBtn}
                                style={{
                                    maxWidth: "120px",
                                    minWidth: "120px",
                                    height: "60px",
                                    border: "1px dashed #ccc",
                                    backgroundColor: "#eaecf1",
                                    color: "#666",
                                    fontSize: "1.5rem",
                                    cursor: "pointer",
                                    padding: "8px 12px",
                                    borderRadius: "8px",
                                    flex: "0 0 40px",
                                }}
                            >
                                +
                            </button>
                        </div>
                    </div>
                );
            })}

        </section>
    );
}
