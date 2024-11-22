"use client"
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Plus, Edit, Trash, Upload } from "lucide-react";
import axios from "axios";
import type { ModelTemplate } from "@prisma/client"

export default function ModelManagementPage() {
  const [models, setModels] = useState([]);
  const [formData, setFormData] = useState({
    name: '',
    provider: '',
    avatar: '',
    description: '',
    baseEndpoint: 'https://api.openai.com/v1',
    isEnabled: true
  });
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState('');

  useEffect(() => {
    fetchModels();
  }, []);

  const fetchModels = async () => {
    try {
      const response = await axios.get('/api/model-templates');
      setModels(response.data);
    } catch (error) {
      console.error('Failed to fetch models:', error);
    }
  };

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setAvatarFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatarPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      // 首先上传头像（如果有）
      let avatarPath = '';
      if (avatarFile) {
        const formData = new FormData();
        formData.append('file', avatarFile);
        const uploadRes = await axios.post('/api/upload', formData);
        avatarPath = uploadRes.data.path;
      }

      // 创建模型
      const modelData = {
        ...formData,
        modelId: `${formData.provider.toLowerCase()}-${formData.name.toLowerCase().replace(/\s+/g, '-')}`,
        avatar: avatarPath || formData.avatar,
      };

      await axios.post('/api/model-templates', modelData);
      fetchModels();
      
      // 重置表单
      setFormData({
        name: '',
        provider: '',
        avatar: '',
        description: '',
        baseEndpoint: 'https://api.openai.com/v1',
        isEnabled: true
      });
      setAvatarFile(null);
      setAvatarPreview('');
    } catch (error) {
      console.error('Failed to create model:', error);
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this model?')) {
      try {
        await axios.delete(`/api/model-templates/${id}`);
        fetchModels();
      } catch (error) {
        console.error('Failed to delete model:', error);
      }
    }
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Model Templates</h1>
        <Dialog>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" /> Add Model
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Model Template</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Provider</label>
                <Input
                  value={formData.provider}
                  onChange={(e) => setFormData({...formData, provider: e.target.value})}
                  placeholder="e.g. OpenAI, Anthropic"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Model Name</label>
                <Input
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  placeholder="e.g. GPT-4, Claude"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Avatar</label>
                <div className="flex items-center space-x-4">
                  {avatarPreview && (
                    <img src={avatarPreview} alt="Preview" className="w-12 h-12 rounded-full object-cover" />
                  )}
                  <label className="flex items-center px-4 py-2 bg-secondary rounded-md cursor-pointer">
                    <Upload className="mr-2 h-4 w-4" />
                    <span>Upload Image</span>
                    <input
                      type="file"
                      className="hidden"
                      accept="image/*"
                      onChange={handleAvatarChange}
                    />
                  </label>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Description</label>
                <Textarea
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Base Endpoint</label>
                <Input
                  value={formData.baseEndpoint}
                  onChange={(e) => setFormData({...formData, baseEndpoint: e.target.value})}
                  required
                />
              </div>
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium">Enabled</label>
                <Switch
                  checked={formData.isEnabled}
                  onCheckedChange={(checked) => setFormData({...formData, isEnabled: checked})}
                />
              </div>
              <Button type="submit" className="w-full">Create Model</Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4">
        {models.map((model: ModelTemplate) => (
          <div key={model.id} className="border p-4 rounded-lg flex justify-between items-center">
            <div className="flex items-center space-x-4">
              {model.avatar && (
                <img src={model.avatar} alt={model.name} className="w-12 h-12 rounded-full object-cover" />
              )}
              <div>
                <h3 className="font-semibold">{model.name}</h3>
                <p className="text-sm text-gray-500">{model.provider}</p>
                <p className="text-sm">{model.description}</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <Switch
                checked={model.isEnabled}
                onCheckedChange={async (checked) => {
                  try {
                    await axios.patch(`/api/model-templates/${model.id}`, {
                      isEnabled: checked
                    });
                    fetchModels();
                  } catch (error) {
                    console.error('Failed to update model status:', error);
                  }
                }}
              />
              <div className="flex space-x-2">
                <Button variant="outline" size="sm">
                  <Edit className="h-4 w-4" />
                </Button>
                <Button 
                  variant="destructive" 
                  size="sm"
                  onClick={() => handleDelete(model.id)}
                >
                  <Trash className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}