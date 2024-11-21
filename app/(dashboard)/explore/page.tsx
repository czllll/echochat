"use client"
import { useEffect, useState } from "react";
import Heading from "@/components/heading";
import { Input } from "@/components/ui/input";
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Search } from "lucide-react";
import Image from 'next/image';
import { Button } from "@/components/ui/button";
import axios from "axios";
import { useRouter } from "next/navigation";
import type { ModelTemplate } from "@prisma/client";
import { Label } from "@/components/ui/label";
import { toast } from "react-hot-toast";
import { getServerSession } from "next-auth";
import { authConfig } from "@/lib/auth";

const AllChatPage = () => {
    const router = useRouter();
    const [models, setModels] = useState<ModelTemplate[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [endpoint, setEndpoint] = useState("");
    const [apiKey, setApiKey] = useState("");
    const [botName, setBotName] = useState("");

    useEffect(() => {
        const fetchModels = async () => {
            try {
                const response = await axios.get('/api/model-templates');
                setModels(response.data);
            } catch (error) {
                console.error('[FETCH_MODELS_ERROR]', error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchModels();
    }, []);

    const createBot = async(templateId: string, model: string) => {
        try {
            if (!endpoint || !apiKey || !botName) {
                toast.error("Please fill in all fields");
                return;
            }

            // 创建bot
            const botResponse = await axios.post('/api/bots', {
                name: botName,
                model,
                apiKey,
                endpoint,
                templateId
            });
            
            const botId = botResponse.data.id;
            const chatResponse = await axios.post('/api/chat', {
                chatTitle: "New chat",
                botId,
            });
            
            const chatId = chatResponse.data.id;
            router.push(`/chat/${chatId}`);
            toast.success("Bot and chat created successfully");
        } catch (error) {
            console.log('[CREATE_BOT_ERROR]', error);
            toast.error("Failed to create bot");
        }
    }

    return (
        <div>
            <Heading title="Explore"/>
            <div className="flex flex-col">
                <div className="px-16 py-8">
                    <div className="relative">
                        <span className="absolute inset-y-0 left-3 flex items-center text-gray-400">
                            <Search className="w-5 h-5" />
                        </span>
                        <Input
                            placeholder="Search for bots or people"
                            className="pl-10 rounded-full border border-gray-300 h-10"
                        />
                    </div>
                    <div className="space-y-4 border-b py-4">
                        {isLoading ? (
                            <div className="text-center py-4">Loading...</div>
                        ) : models.length === 0 ? (
                            <div className="text-center py-4">No models available</div>
                        ) : (
                            models.map((model) => (
                                <Dialog key={model.id}>
                                    <DialogTrigger asChild>
                                        <div className="flex flex-row space-x-4 cursor-pointer hover:bg-black/5 p-4 rounded-lg">
                                            <div className="relative w-20 h-20">
                                                <Image 
                                                    fill 
                                                    src={model.avatar || "/default-model-avatar.png"} 
                                                    alt={`${model.name} avatar`}
                                                    className="rounded-lg object-cover"
                                                />
                                            </div>
                                            <div className="flex flex-col space-y-1 w-5/6">
                                                <div className="font-bold text-lg">{model.name}</div>
                                                <div className="text-ellipsis whitespace-pre-wrap line-clamp-2">
                                                    {model.description}
                                                </div>
                                            </div>
                                        </div>
                                    </DialogTrigger>
                                    <DialogContent>
                                        <DialogHeader>
                                            <DialogTitle>{model.name}</DialogTitle>
                                            <DialogDescription>
                                                <div className="relative w-20 h-20 mx-auto">
                                                    <Image 
                                                        fill 
                                                        src={model.avatar || "/default-model-avatar.png"} 
                                                        alt={`${model.name} avatar`}
                                                        className="rounded-lg object-cover"
                                                    />
                                                </div>
                                                <p className="mt-4">{model.description}</p>
                                            </DialogDescription>
                                        </DialogHeader>
                                        <div className="space-y-4 mt-4">
                                            <div className="space-y-2">
                                                <Label htmlFor="botName">Bot Name</Label>
                                                <Input
                                                    id="botName"
                                                    placeholder="Enter a name for your bot"
                                                    value={botName}
                                                    onChange={(e) => setBotName(e.target.value)}
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <Label htmlFor="endpoint">Endpoint URL</Label>
                                                <Input
                                                    id="endpoint"
                                                    placeholder="Enter your endpoint URL"
                                                    value={endpoint}
                                                    onChange={(e) => setEndpoint(e.target.value)}
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <Label htmlFor="apiKey">API Key</Label>
                                                <Input
                                                    id="apiKey"
                                                    type="password"
                                                    placeholder="Enter your API key"
                                                    value={apiKey}
                                                    onChange={(e) => setApiKey(e.target.value)}
                                                />
                                            </div>
                                            <Button 
                                                onClick={() => createBot(model.id, model.modelId)}
                                                className="w-full"
                                            >
                                                Create Bot & Start Chat
                                            </Button>
                                        </div>
                                    </DialogContent>
                                </Dialog>
                            ))
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}

export default AllChatPage;