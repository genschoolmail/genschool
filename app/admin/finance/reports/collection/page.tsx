import { getDailyCollection } from "@/lib/report-actions";
import CollectionClient from "./CollectionClient";

export default async function DailyCollectionPage() {
    const today = new Date();
    const data = await getDailyCollection(today);

    return (
        <CollectionClient
            initialData={data}
            initialDate={today.toISOString().split('T')[0]}
        />
    );
}
