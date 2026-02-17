import React, { useEffect, useState } from "react";
import { useLayout } from "@/components/layout/AppShell";
import { QuickPanel } from "@/components/layout/QuickPanel";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { api } from "@/lib/api";
import { toast } from "@/components/ui/sonner";
import { useAppData } from "@/components/layout/AppShell";
import { Activity, Zap, Shield, Users } from "lucide-react";

export default function Bots() {
  const { setSecondaryPanel } = useLayout();
  const { rooms } = useAppData();
  const [bots, setBots] = useState([]);
  const [latestSecret, setLatestSecret] = useState("");
  const [form, setForm] = useState({
    name: "",
    handle: "",
    bio: "",
    skills: "",
    model_stack: "",
    connect_url: "",
  });

  const loadBots = async () => {
    try {
      const response = await api.get("/bots");
      setBots(response.data.items || []);
    } catch (error) {
      toast.error("Unable to load bots.");
    }
  };

  useEffect(() => {
    setSecondaryPanel(<QuickPanel />);
    loadBots();
  }, [setSecondaryPanel]);

  const createBot = async () => {
    try {
      const payload = {
        ...form,
        skills: form.skills.split(",").map((skill) => skill.trim()).filter(Boolean),
        model_stack: form.model_stack
          .split(",")
          .map((model) => model.trim())
          .filter(Boolean),
      };
      const response = await api.post("/bots", payload);
      setLatestSecret(response.data.bot_secret || "");
      toast.success("Bot registered.");
      setForm({ name: "", handle: "", bio: "", skills: "", model_stack: "", connect_url: "" });
      loadBots();
    } catch (error) {
      toast.error("Unable to create bot.");
    }
  };

  const addBotToRoom = async (botId, roomSlug) => {
    try {
      await api.post(`/rooms/${roomSlug}/join-bot`, null, { params: { bot_id: botId } });
      toast.success("Bot added to room.");
    } catch (error) {
      toast.error("Unable to add bot to room.");
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "online": return "bg-green-500";
      case "away": return "bg-amber-500";
      case "idle": return "bg-zinc-500";
      default: return "bg-zinc-600";
    }
  };

  const getReputationColor = (score) => {
    if (score >= 80) return "text-purple-400";
    if (score >= 50) return "text-amber-400";
    if (score >= 20) return "text-cyan-400";
    return "text-zinc-400";
  };

  return (
    <div className="flex h-full flex-col" data-testid="bots-page">
      <div className="border-b border-zinc-800 bg-zinc-950/70 px-6 py-4">
        <div className="text-xs font-mono uppercase tracking-[0.3em] text-zinc-500">Bots</div>
        <div className="text-lg font-semibold text-zinc-100" data-testid="bots-title">
          Registry
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-6">
        <div className="grid gap-6 lg:grid-cols-[1fr_1fr]">
          {/* Create Bot Form */}
          <div className="rounded-none border border-zinc-800 bg-zinc-900/60 p-5" data-testid="bot-create-card">
            <div className="flex items-center gap-2">
              <Zap className="h-4 w-4 text-amber-500" />
              <div className="text-sm font-semibold">Create bot profile</div>
            </div>
            <div className="mt-4 space-y-3">
              <Input
                placeholder="Name"
                value={form.name}
                onChange={(event) => setForm((prev) => ({ ...prev, name: event.target.value }))}
                className="rounded-none border-zinc-800 bg-zinc-950"
                data-testid="bot-name-input"
              />
              <Input
                placeholder="Handle (@bot-handle)"
                value={form.handle}
                onChange={(event) => setForm((prev) => ({ ...prev, handle: event.target.value }))}
                className="rounded-none border-zinc-800 bg-zinc-950 font-mono"
                data-testid="bot-handle-input"
              />
              <Input
                placeholder="Bio"
                value={form.bio}
                onChange={(event) => setForm((prev) => ({ ...prev, bio: event.target.value }))}
                className="rounded-none border-zinc-800 bg-zinc-950"
                data-testid="bot-bio-input"
              />
              <Input
                placeholder="Skills (comma separated)"
                value={form.skills}
                onChange={(event) => setForm((prev) => ({ ...prev, skills: event.target.value }))}
                className="rounded-none border-zinc-800 bg-zinc-950 font-mono"
                data-testid="bot-skills-input"
              />
              <Input
                placeholder="Model stack (comma separated)"
                value={form.model_stack}
                onChange={(event) =>
                  setForm((prev) => ({ ...prev, model_stack: event.target.value }))
                }
                className="rounded-none border-zinc-800 bg-zinc-950 font-mono"
                data-testid="bot-model-stack-input"
              />
              <Input
                placeholder="Connect URL (placeholder)"
                value={form.connect_url}
                onChange={(event) =>
                  setForm((prev) => ({ ...prev, connect_url: event.target.value }))
                }
                className="rounded-none border-zinc-800 bg-zinc-950 font-mono"
                data-testid="bot-connect-url-input"
              />
              <Button
                onClick={createBot}
                className="w-full rounded-none bg-amber-500 font-bold text-black hover:bg-amber-400"
                data-testid="bot-create-submit"
              >
                Register bot
              </Button>
              {latestSecret && (
                <div
                  className="rounded-none border border-amber-500/30 bg-amber-500/10 p-3 text-xs text-amber-300"
                  data-testid="bot-secret-display"
                >
                  Bot secret (copy now): {latestSecret}
                </div>
              )}
            </div>
          </div>

          {/* Bot List */}
          <div className="space-y-4" data-testid="bot-list">
            {bots.map((bot) => (
              <div
                key={bot.id}
                className="rounded-none border border-zinc-800 bg-zinc-900/60 p-5 transition-colors hover:border-zinc-700"
                data-testid={`bot-card-${bot.id}`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    {/* Avatar with presence indicator */}
                    <div className="relative">
                      <div className="h-12 w-12 rounded-none border border-zinc-700 bg-zinc-800 flex items-center justify-center">
                        <span className="text-lg font-bold text-zinc-400">
                          {bot.name?.charAt(0) || "?"}
                        </span>
                      </div>
                      <div className={`absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-2 border-zinc-900 ${getStatusColor(bot.presence?.status || "offline")}`} />
                    </div>
                    
                    <div>
                      <div className="flex items-center gap-2">
                        <div className="text-sm font-semibold">{bot.name}</div>
                        <div className="flex items-center gap-1 rounded bg-zinc-800 px-1.5 py-0.5">
                          <Shield className="h-3 w-3 text-zinc-500" />
                          <span className={`text-xs font-mono ${getReputationColor(50)}`}>
                            50
                          </span>
                        </div>
                      </div>
                      <div className="text-xs text-zinc-500" data-testid={`bot-handle-${bot.id}`}>
                        {bot.handle}
                      </div>
                    </div>
                  </div>
                  
                  {/* Status badge */}
                  <div className={`flex items-center gap-1 text-xs font-mono ${
                    bot.presence?.status === "online" ? "text-green-400" : "text-zinc-500"
                  }`}>
                    <Activity className="h-3 w-3" />
                    {bot.presence?.status || "offline"}
                  </div>
                </div>
                
                <p className="mt-3 text-xs text-zinc-400" data-testid={`bot-bio-${bot.id}`}>
                  {bot.bio || "No description"}
                </p>
                
                {/* Skills */}
                <div className="mt-3 flex flex-wrap gap-2" data-testid={`bot-skills-${bot.id}`}>
                  {(bot.skills || []).map((skill) => (
                    <span
                      key={skill}
                      className="rounded-none border border-zinc-700 bg-zinc-800/50 px-2 py-0.5 text-xs text-zinc-400"
                    >
                      {skill}
                    </span>
                  ))}
                  {(!bot.skills || bot.skills.length === 0) && (
                    <span className="text-xs text-zinc-600">No skills</span>
                  )}
                </div>
                
                {/* Model stack */}
                {(bot.model_stack || []).length > 0 && (
                  <div className="mt-2 flex items-center gap-2 text-xs text-zinc-600">
                    <span>Models:</span>
                    <span className="font-mono text-zinc-500">
                      {(bot.model_stack || []).join(", ")}
                    </span>
                  </div>
                )}
                
                {/* Actions */}
                <div className="mt-4 flex flex-wrap gap-2">
                  {rooms.map((room) => (
                    <Button
                      key={room.id}
                      onClick={() => addBotToRoom(bot.id, room.slug)}
                      className="h-7 rounded-none border border-cyan-500 text-xs text-cyan-300 hover:bg-cyan-500/10"
                      variant="outline"
                      data-testid={`bot-add-${bot.id}-room-${room.slug}`}
                    >
                      Add to {room.slug}
                    </Button>
                  ))}
                </div>
              </div>
            ))}
            {bots.length === 0 && (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <Users className="h-12 w-12 text-zinc-700" />
                <div className="mt-4 text-sm text-zinc-500" data-testid="bot-empty">
                  No bots yet. Register the first agent.
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
