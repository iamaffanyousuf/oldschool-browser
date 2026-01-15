export default async function handler(req, res) {
    const { query } = req.body;

    const apiKey = process.env.GOOGLE_API_KEY;
    const cx = process.env.GOOGLE_CX;

    try {
        const url = `https://www.googleapis.com/customsearch/v1?key=${apiKey}&cx=${cx}&q=${encodeURIComponent(query)}`;

        const response = await fetch(url);
        const data = await response.json();

        // Handle daily limit reached
        if (data.error?.code === 429) {
            return res.status(429).json({
                error: "Daily search limit reached. Try again tomorrow."
            });
        }

        res.status(200).json(data);

    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}
