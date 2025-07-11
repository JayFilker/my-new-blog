// @ts-nocheck
import { useEffect, useState } from 'react'
import { marked } from 'marked'
interface CommentProps {
    articleTitle: string;
}

interface Comment {
    author: string;
    date: string;
    text: string;
}
export default function Comment({ articleTitle }: CommentProps) {
    
    const [newComment, setNewComment] = useState({ author: "", text: "", articleTitle });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [message, setMessage] = useState("");
    const [dataDemo,setDataDemo]=useState<Comment[]>({ author: "", text: "", articleTitle: '' })
    async function send(){
        const responsedemo = await fetch('https://myblogvalue-production.up.railway.app/comments', {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
        });
        const data = await responsedemo.json();
        setDataDemo(
            data.comments.filter(
                (item: { articleTitle: string }) => item.articleTitle === articleTitle
            )
        );
    }
    // async function sendblog(){
    //     const responsedemo2 = await fetch('/api/edit-post', {
    //         method: 'POST',
    //         headers: {
    //             'Content-Type': 'application/json',
    //         },
    //         body: JSON.stringify({slug:'fsfs', updates:{frontmatter:{},content:''} , update:true }),
    //     });
    //    const data = await responsedemo2.json();
    //       console.log(data.comments);
    // }
    
    
    useEffect(() => {
        send()
        // sendblog()
    },[])
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        if (!newComment.author.trim() || !newComment.text.trim()) {
            setMessage("请填写昵称和评论内容");
            return;
        }
        
        setIsSubmitting(true);
        
        try {
            const response = await fetch('https://myblogvalue-production.up.railway.app/comments', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(newComment),
            });
            
            const result = await response.json();
            if (result.success) {
                setMessage("评论已提交，审核后将显示");
                setNewComment({...newComment, author: "", text: ""});
                
                // 如果是即时显示类型，可以更新本地评论列表
                // setCommentList([...commentList, {...newComment, date: new Date().toISOString()}]);
            } else {
                setMessage(`提交失败: ${result.message}`);
            }
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
        } catch (error) {
            
            setMessage("提交评论时发生错误，请稍后再试");
        } finally {
            setIsSubmitting(false);
        }
        
        send()
        
    };
    
    return (
        <section className="comment-section my-8">
            <h2 className="text-2xl font-bold mb-4">评论</h2>
            
            {dataDemo.length > 0 ? (
                <div className="space-y-4 mb-6">
                    {dataDemo.map((comment, index:number) => (
                        <div key={index} className="bg-gray-100 dark:bg-gray-800 p-4 rounded-lg">
                            <div className="flex items-center mb-2 text-sm text-gray-600 dark:text-gray-400">
                                <span className="font-semibold">{comment.author}</span>
                                <span className="mx-2">•</span>
                                <time>{new Date(comment.date).toLocaleDateString()}</time>
                            </div>
                            <p className="text-gray-800 dark:text-gray-200" dangerouslySetInnerHTML={{ __html: marked(comment.text) }}></p>
                        </div>
                    ))}
                </div>
            ) : (
                <p className="text-gray-600 dark:text-gray-400 mb-4">还没有评论。成为第一个评论的人吧！</p>
            )}
            
            <form onSubmit={handleSubmit} className="space-y-4 mt-6">
                <div>
                    <label htmlFor="author" className="block text-sm font-medium mb-1">昵称</label>
                    <input
                        type="text"
                        id="author"
                        value={newComment.author}
                        onChange={(e) => setNewComment({...newComment, author: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md dark:bg-gray-800"
                        required
                    />
                </div>
                
                <div>
                    <label htmlFor="text" className="block text-sm font-medium mb-1">评论</label>
                    <textarea
                        id="text"
                        value={newComment.text}
                        onChange={(e) => setNewComment({...newComment, text: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md h-32 dark:bg-gray-800"
                        required
                    />
                </div>
                
                {message && (
                    <div className="text-sm py-2 px-3 rounded-md bg-blue-50 dark:bg-blue-900 text-blue-800 dark:text-blue-200">
                        {message}
                    </div>
                )}
                
                <button
                    type="submit"
                    disabled={isSubmitting}
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
                >
                    {isSubmitting ? "提交中..." : "发表评论"}
                </button>
            </form>
        </section>
    );
}
