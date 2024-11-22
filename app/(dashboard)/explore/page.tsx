"use client"
import { useEffect, useState } from "react";
import Heading from "@/components/heading";
import { Input } from "@/components/ui/input";
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Search, Bot } from "lucide-react";
import Image from 'next/image';
import { Button } from "@/components/ui/button";
import axios from "axios";
import { useRouter } from "next/navigation";
import type { ModelTemplate } from "@prisma/client";
import { Label } from "@/components/ui/label";
import { toast } from "react-hot-toast";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

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

    const createBot = async(templateId: string, modelName: string) => {
        try {
            if (!endpoint || !apiKey || !botName) {
                toast.error("Please fill in all fields");
                return;
            }

            const botResponse = await axios.post('/api/bots', {
                name: botName,
                model: modelName,
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
                <div className="px-4 md:px-16 py-8">
                    <div className="relative mb-8">
                        <span className="absolute inset-y-0 left-3 flex items-center text-gray-400">
                            <Search className="w-5 h-5" />
                        </span>
                        <Input
                            placeholder="Search for bots or people"
                            className="pl-10 rounded-full border border-gray-300 h-10"
                        />
                    </div>

                    {isLoading ? (
                        <div className="text-center py-4">Loading...</div>
                    ) : models.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-[60vh]">
                            <Bot className="h-8 w-8 text-muted-foreground mb-2"/>
                            <p className="text-muted-foreground">No models available</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {models.map((model) => (
                                <Dialog key={model.id}>
                                    <DialogTrigger asChild>
                                        <Card className="cursor-pointer hover:shadow-md transition duration-300">
                                            <CardHeader className="p-4">
                                                <div className="flex items-center space-x-4">
                                                    <div className="relative w-16 h-16">
                                                        <Image 
                                                            fill 
                                                            src={model.avatar || "/default-model-avatar.png"} 
                                                            alt={`${model.name} avatar`}
                                                            className="rounded-lg object-cover"
                                                        />
                                                    </div>
                                                    <div className="flex-1">
                                                        <h3 className="font-bold text-lg">{model.name}</h3>
                                                    </div>
                                                </div>
                                            </CardHeader>
                                            <CardContent className="p-4 pt-0">
                                                <p className="text-sm text-muted-foreground line-clamp-3">
                                                    {model.description}
                                                </p>
                                            </CardContent>
                                        </Card>
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
                                                onClick={() => createBot(model.id, model.name)}
                                                className="w-full"
                                            >
                                                Create Bot & Start Chat
                                            </Button>
                                        </div>
                                    </DialogContent>
                                </Dialog>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}

export default AllChatPage;