import { ArrowRight } from 'lucide-react'

export default function Blog() {
    const posts = [
        {
            title: "Introducing Clara AI",
            date: "March 2026",
            tag: "ANNOUNCEMENT",
            description: "How we built an AI pipeline that automates voice agent configuration for service businesses."
        },
        {
            title: "How Pipeline A Works",
            date: "March 2026",
            tag: "TECHNICAL",
            description: "A deep dive into how Mistral AI extracts business rules from raw call transcripts."
        },
        {
            title: "Zero Cost AI Pipeline",
            date: "March 2026",
            tag: "GUIDE",
            description: "How we built a 6-position LLM fallback chain that processes transcripts at zero cost."
        }
    ]

    return (
        <div className="min-h-screen bg-[#0A0F1E] text-white pt-16 pb-24 px-6 relative">
            <div className="max-w-4xl mx-auto relative z-10">
                <div className="mb-16">
                    <h1 className="text-4xl md:text-5xl font-bold mb-4">Clara AI Blog</h1>
                    <p className="text-xl text-slate-400">Updates, guides and insights</p>
                </div>

                <div className="grid gap-8">
                    {posts.map((post, i) => (
                        <article key={i} className="bg-white/5 backdrop-blur-[20px] border border-white/10 rounded-2xl p-8 hover:bg-white/10 transition-colors cursor-pointer group">
                            <div className="flex items-center gap-4 mb-4">
                                <span className="text-xs font-bold px-2.5 py-1 bg-white/10 text-slate-300 rounded-md tracking-wider">
                                    {post.tag}
                                </span>
                                <span className="text-sm text-slate-500">{post.date}</span>
                            </div>

                            <h2 className="text-2xl font-bold mb-3 group-hover:text-blue-400 transition-colors">{post.title}</h2>
                            <p className="text-slate-400 leading-relaxed mb-6">{post.description}</p>

                            <div className="flex items-center text-blue-500 font-medium font-sm group-hover:text-blue-400">
                                Read More <ArrowRight className="w-4 h-4 ml-2 transition-transform group-hover:translate-x-1" />
                            </div>
                        </article>
                    ))}
                </div>
            </div>
        </div>
    )
}
