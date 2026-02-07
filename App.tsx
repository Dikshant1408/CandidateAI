
import React, { useState, useMemo, useEffect } from 'react';
import { 
  MantineProvider, 
  AppShell, 
  Text, 
  Title, 
  Group, 
  TextInput, 
  Select, 
  ScrollArea, 
  Badge, 
  Avatar, 
  Card, 
  Grid, 
  Table, 
  Button, 
  Tooltip as MantineTooltip,
  Paper,
  Box,
  Divider,
  ActionIcon,
  Stack,
  ThemeIcon,
  Progress,
  Container,
  useMantineColorScheme,
  useComputedColorScheme,
  SegmentedControl,
  Switch,
  Textarea
} from '@mantine/core';
import { 
  Users, 
  Trophy, 
  BarChart3, 
  Search, 
  Share2, 
  Zap, 
  ChevronRight,
  TrendingUp,
  BrainCircuit,
  Settings as SettingsIcon,
  Target,
  ShieldAlert,
  Leaf,
  Users2,
  Filter,
  CheckCircle2,
  LayoutDashboard,
  Moon,
  Sun,
  Scale,
  Trash2,
  Maximize2,
  Minimize2,
  Grid as GridIcon,
  Info,
  Plus,
  X,
  Sparkles,
  Monitor,
  RefreshCw,
  StickyNote
} from 'lucide-react';
import { 
  Radar, 
  RadarChart, 
  PolarGrid, 
  PolarAngleAxis, 
  ResponsiveContainer,
  AreaChart,
  Area,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip as RechartsTooltip
} from 'recharts';
import { generateCandidates, generateMockEvaluations } from './mockData';
import { Candidate, Evaluation } from './types';
import { evaluateCandidateWithAI } from './services/geminiService';

type Page = 'dashboard' | 'candidates' | 'rankings' | 'settings' | 'comparison';

const ROLES = [
  'All Roles',
  'Senior Software Engineer', 'Product Manager', 'UX Designer', 
  'Operations Director', 'Sustainability Lead', 'HR Business Partner',
  'Marketing Strategy Head', 'Data Scientist', 'CTO', 'Project Manager'
];

const AI_MODELS = [
  { value: 'gemini-3-flash-preview', label: 'Gemini 3 Flash (Fast)' },
  { value: 'gemini-3-pro-preview', label: 'Gemini 3 Pro (High Quality)' },
  { value: 'gemini-flash-lite-latest', label: 'Gemini Flash Lite (Efficient)' }
];

const NOTES_STORAGE_KEY = 'candidate_ai_notes';

const AppContent: React.FC = () => {
  const { setColorScheme, colorScheme } = useMantineColorScheme();
  const computedColorScheme = useComputedColorScheme('light', { getInitialValueInEffect: true });
  
  const [activePage, setActivePage] = useState<Page>('dashboard');
  const [candidates] = useState<Candidate[]>(generateCandidates());
  const [evaluations, setEvaluations] = useState<Evaluation[]>(() => generateMockEvaluations(candidates));
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState('All Roles');
  const [selectedCandidateId, setSelectedCandidateId] = useState<string | null>(candidates[0].id);
  const [isEvaluating, setIsEvaluating] = useState<string | null>(null);
  const [compareIds, setCompareIds] = useState<string[]>([]);
  
  // State for private candidate notes
  const [candidateNotes, setCandidateNotes] = useState<Record<string, string>>(() => {
    const saved = localStorage.getItem(NOTES_STORAGE_KEY);
    return saved ? JSON.parse(saved) : {};
  });

  const [settings, setSettings] = useState({
    autoEval: false,
    model: 'gemini-3-flash-preview',
    notifications: true
  });

  // Sync notes to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem(NOTES_STORAGE_KEY, JSON.stringify(candidateNotes));
  }, [candidateNotes]);

  const toggleColorScheme = () => {
    setColorScheme(computedColorScheme === 'dark' ? 'light' : 'dark');
  };

  const rankings = useMemo(() => {
    return evaluations
      .map(e => ({
        candidateId: e.candidateId,
        totalScore: (e.crisisManagementScore + e.sustainabilityScore + e.teamMotivationScore) / 3,
      }))
      .sort((a, b) => b.totalScore - a.totalScore)
      .map((r, i) => ({ ...r, rank: i + 1 }));
  }, [evaluations]);

  const selectedCandidate = candidates.find(c => c.id === selectedCandidateId);
  const selectedEvaluation = evaluations.find(e => e.candidateId === selectedCandidateId);
  const selectedRanking = rankings.find(r => r.candidateId === selectedCandidateId);

  const filteredCandidates = useMemo(() => {
    return candidates.filter(c => {
      const matchesSearch = c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                            c.role.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesRole = roleFilter === 'All Roles' || c.role === roleFilter;
      return matchesSearch && matchesRole;
    });
  }, [candidates, searchQuery, roleFilter]);

  const runAIEvaluation = async (candidateId: string) => {
    const candidate = candidates.find(c => c.id === candidateId);
    if (!candidate || isEvaluating === candidateId) return;
    setIsEvaluating(candidateId);
    
    // Using the model selected in settings
    const newEval = await evaluateCandidateWithAI(candidate, settings.model);
    
    setEvaluations(prev => {
      const index = prev.findIndex(e => e.candidateId === candidateId);
      if (index > -1) {
        const next = [...prev];
        next[index] = newEval;
        return next;
      }
      return [...prev, newEval];
    });
    setIsEvaluating(null);
  };

  const toggleCompare = (id: string) => {
    setCompareIds(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
  };

  const shareCandidate = (c: Candidate) => {
    if (typeof navigator !== 'undefined' && navigator.share) {
      navigator.share({
        title: `Candidate AI Profile: ${c.name}`,
        text: `Reviewing candidate for the ${c.role} position.`,
        url: window.location.href,
      }).catch(() => {});
    } else {
      alert(`Candidate link for ${c.name} can be shared via the application dashboard.`);
    }
  };

  const resetAllData = () => {
    if (window.confirm("Are you sure you want to reset all evaluation data to defaults?")) {
      setEvaluations(generateMockEvaluations(candidates));
      setCandidateNotes({});
      localStorage.removeItem(NOTES_STORAGE_KEY);
    }
  };

  const handleNoteChange = (id: string, value: string) => {
    setCandidateNotes(prev => ({
      ...prev,
      [id]: value
    }));
  };

  // --- UI Helpers ---

  const HeatmapCell = ({ value }: { value: number }) => (
    <MantineTooltip label={`${value.toFixed(0)}%`}>
      <Box 
        h={18} 
        style={{ 
          backgroundColor: `rgba(99, 102, 241, ${(value - 50) / 50})`,
          borderRadius: '4px',
          flex: 1
        }} 
      />
    </MantineTooltip>
  );

  const ScoreBar = ({ label, score, icon: Icon, color }: { label: string, score: number, icon: any, color: string }) => (
    <Box mb="sm">
      <Group justify="space-between" mb={4}>
        <Group gap={6}>
          <Icon size={14} className={color} />
          <Text size="xs" fw={700} tt="uppercase" c="dimmed">{label}</Text>
        </Group>
        <Text size="xs" fw={700}>{Math.round(score)}%</Text>
      </Group>
      <Progress value={score} color={color.replace('text-', '')} size="sm" radius="xl" />
    </Box>
  );

  // --- Page Views ---

  const DashboardView = () => (
    <Grid gutter="lg">
      <Grid.Col span={{ base: 12, xl: 8 }}>
        <Grid mb="lg">
          <Grid.Col span={{ base: 12, md: 4 }}>
            <Paper p="md" radius="md" withBorder>
              <Group justify="space-between">
                <div>
                  <Text size="xs" fw={700} tt="uppercase" c="dimmed">Total Candidates</Text>
                  <Text size="xl" fw={900}>{candidates.length}</Text>
                </div>
                <ThemeIcon size="lg" radius="md" variant="light" color="indigo"><Users size={20} /></ThemeIcon>
              </Group>
            </Paper>
          </Grid.Col>
          <Grid.Col span={{ base: 12, md: 4 }}>
            <Paper p="md" radius="md" withBorder>
              <Group justify="space-between">
                <div>
                  <Text size="xs" fw={700} tt="uppercase" c="dimmed">Avg. Neural Score</Text>
                  <Text size="xl" fw={900}>{(rankings.reduce((a, b) => a + b.totalScore, 0) / (rankings.length || 1)).toFixed(1)}</Text>
                </div>
                <ThemeIcon size="lg" radius="md" variant="light" color="teal"><TrendingUp size={20} /></ThemeIcon>
              </Group>
            </Paper>
          </Grid.Col>
          <Grid.Col span={{ base: 12, md: 4 }}>
            <Paper p="md" radius="md" withBorder>
              <Group justify="space-between">
                <div>
                  <Text size="xs" fw={700} tt="uppercase" c="dimmed">AI Evaluations</Text>
                  <Text size="xl" fw={900}>{evaluations.length}</Text>
                </div>
                <ThemeIcon size="lg" radius="md" variant="light" color="orange"><BrainCircuit size={20} /></ThemeIcon>
              </Group>
            </Paper>
          </Grid.Col>
        </Grid>

        <Grid mb="lg">
          <Grid.Col span={{ base: 12, md: 6 }}>
            <Paper radius="md" withBorder style={{ overflow: 'hidden' }}>
              <Box p="md" style={{ background: computedColorScheme === 'dark' ? 'var(--mantine-color-dark-6)' : 'var(--mantine-color-gray-0)' }}>
                <Group justify="space-between">
                  <Text size="sm" fw={700}><Trophy size={16} className="text-orange-500 inline mr-2" /> Top 10 Leaderboard</Text>
                  <Button variant="subtle" size="compact-xs" onClick={() => setActivePage('rankings')}>Full Rank</Button>
                </Group>
              </Box>
              <Table verticalSpacing="sm">
                <Table.Thead>
                  <Table.Tr>
                    <Table.Th><Text size="xs" tt="uppercase" c="dimmed">Rank</Text></Table.Th>
                    <Table.Th><Text size="xs" tt="uppercase" c="dimmed">Candidate</Text></Table.Th>
                    <Table.Th><Text size="xs" tt="uppercase" c="dimmed" ta="center">Score</Text></Table.Th>
                  </Table.Tr>
                </Table.Thead>
                <Table.Tbody>
                  {rankings.slice(0, 10).map((r) => {
                    const c = candidates.find(cand => cand.id === r.candidateId)!;
                    return (
                      <Table.Tr 
                        key={r.candidateId} 
                        onClick={() => setSelectedCandidateId(c.id)}
                        style={{ 
                          cursor: 'pointer', 
                          backgroundColor: selectedCandidateId === c.id 
                            ? (computedColorScheme === 'dark' ? 'var(--mantine-color-indigo-9)' : 'var(--mantine-color-indigo-0)') 
                            : 'transparent' 
                        }}
                      >
                        <Table.Td>
                          <Badge color={r.rank === 1 ? 'yellow' : r.rank <= 3 ? 'gray' : 'blue'} variant="light">{r.rank}</Badge>
                        </Table.Td>
                        <Table.Td>
                          <Group gap="sm">
                            <Avatar src={c.avatar} size="sm" radius="xl" />
                            <div>
                              <Text size="xs" fw={700}>{c.name}</Text>
                              <Text size="10px" c="dimmed">{c.role}</Text>
                            </div>
                          </Group>
                        </Table.Td>
                        <Table.Td ta="center"><Text size="xs" fw={900}>{r.totalScore.toFixed(0)}</Text></Table.Td>
                      </Table.Tr>
                    );
                  })}
                </Table.Tbody>
              </Table>
            </Paper>
          </Grid.Col>

          <Grid.Col span={{ base: 12, md: 6 }}>
            <Paper p="md" radius="md" withBorder h="100%">
              <Group gap="xs" mb="lg">
                <GridIcon size={16} className="text-indigo-600" />
                <Text size="sm" fw={700}>Skill Intensity Heatmap</Text>
              </Group>
              <Stack gap="md">
                {rankings.slice(0, 6).map((r) => {
                  const c = candidates.find(cand => cand.id === r.candidateId)!;
                  const e = evaluations.find(ev => ev.candidateId === r.candidateId);
                  return (
                    <Group key={c.id} gap="xs">
                      <Box w={80}><Text size="10px" fw={700} tt="uppercase" truncate>{c.name.split(' ')[0]}</Text></Box>
                      <Group gap={4} style={{ flex: 1 }}>
                        <HeatmapCell value={e?.crisisManagementScore || 0} />
                        <HeatmapCell value={e?.sustainabilityScore || 0} />
                        <HeatmapCell value={e?.teamMotivationScore || 0} />
                      </Group>
                    </Group>
                  );
                })}
                <Group gap="xs" pt="sm">
                  <Box w={80}></Box>
                  <Group gap={4} style={{ flex: 1 }} justify="space-between">
                    <Text size="8px" fw={700} ta="center" style={{ flex: 1 }}>CRISIS</Text>
                    <Text size="8px" fw={700} ta="center" style={{ flex: 1 }}>GREEN</Text>
                    <Text size="8px" fw={700} ta="center" style={{ flex: 1 }}>MOTIV</Text>
                  </Group>
                </Group>
              </Stack>
            </Paper>
          </Grid.Col>
        </Grid>
      </Grid.Col>

      <Grid.Col span={{ base: 12, xl: 4 }}>
        <ProfilePanel />
      </Grid.Col>
    </Grid>
  );

  const CandidatesView = () => (
    <Grid gutter="lg">
      <Grid.Col span={{ base: 12, xl: 8 }}>
        <Paper p="md" mb="lg" radius="md" withBorder>
          <Group justify="space-between">
            <Group>
              <Select 
                data={ROLES} 
                value={roleFilter} 
                onChange={(val) => setRoleFilter(val || 'All Roles')}
                size="xs"
                w={200}
                leftSection={<Filter size={14} />}
              />
              <TextInput 
                placeholder="Search name or skill..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.currentTarget.value)}
                size="xs"
                w={250}
                leftSection={<Search size={14} />}
              />
            </Group>
            {compareIds.length > 0 && (
              <Button leftSection={<Scale size={14} />} size="xs" onClick={() => setActivePage('comparison')}>
                Compare ({compareIds.length})
              </Button>
            )}
          </Group>
        </Paper>

        <Grid>
          {filteredCandidates.map(candidate => (
            <Grid.Col key={candidate.id} span={{ base: 12, sm: 6, lg: 4 }}>
              <Card 
                withBorder 
                padding="lg" 
                radius="md" 
                onClick={() => setSelectedCandidateId(candidate.id)}
                style={{ 
                  cursor: 'pointer', 
                  borderColor: selectedCandidateId === candidate.id ? 'var(--mantine-color-indigo-6)' : undefined,
                  boxShadow: selectedCandidateId === candidate.id ? 'var(--mantine-shadow-md)' : undefined
                }}
              >
                <Group justify="space-between" mb="sm">
                  <Avatar src={candidate.avatar} size="lg" radius="md" />
                  <ActionIcon 
                    variant={compareIds.includes(candidate.id) ? 'filled' : 'light'} 
                    onClick={(e) => { e.stopPropagation(); toggleCompare(candidate.id); }}
                  >
                    {compareIds.includes(candidate.id) ? <CheckCircle2 size={16} /> : <Plus size={16} />}
                  </ActionIcon>
                </Group>
                <Text fw={700} size="sm">{candidate.name}</Text>
                <Text size="xs" c="indigo" fw={700} tt="uppercase">{candidate.role}</Text>
                <Group gap={5} mt="sm">
                  {candidate.skills.slice(0, 3).map(skill => (
                    <Badge key={skill} variant="light" size="xs" color="gray">{skill}</Badge>
                  ))}
                </Group>
                <Divider my="sm" variant="dashed" />
                <Group justify="space-between">
                  <Text size="xs" c="dimmed" fw={700}>{candidate.experienceYears}Y Experience</Text>
                  {evaluations.some(e => e.candidateId === candidate.id) && (
                    <ThemeIcon color="orange" size="sm" radius="xl" variant="light"><BrainCircuit size={12} /></ThemeIcon>
                  )}
                </Group>
              </Card>
            </Grid.Col>
          ))}
        </Grid>
      </Grid.Col>
      <Grid.Col span={{ base: 12, xl: 4 }}>
        <ProfilePanel />
      </Grid.Col>
    </Grid>
  );

  const ProfilePanel = () => {
    if (!selectedCandidate) return <Paper p="xl" withBorder h="100%"><Stack align="center" justify="center" h="100%"><Users size={48} style={{ opacity: 0.1 }} /><Text c="dimmed">Select a candidate</Text></Stack></Paper>;
    
    const radarData = selectedEvaluation ? [
      { subject: 'Crisis', A: selectedEvaluation.crisisManagementScore, fullMark: 100 },
      { subject: 'Sustainability', A: selectedEvaluation.sustainabilityScore, fullMark: 100 },
      { subject: 'Team', A: selectedEvaluation.teamMotivationScore, fullMark: 100 },
      { subject: 'Experience', A: Math.min(100, (selectedCandidate.experienceYears || 0) * 7), fullMark: 100 },
      { subject: 'Skills', A: Math.min(100, (selectedCandidate.skills.length || 0) * 18), fullMark: 100 },
    ] : [];

    return (
      <Paper p="xl" withBorder radius="md" style={{ position: 'sticky', top: 20 }}>
        <Group justify="space-between" mb="md">
          <Avatar src={selectedCandidate.avatar} size={80} radius="md" />
          <Stack gap={5} align="flex-end">
            <Group>
              <ActionIcon variant="light" color="indigo" onClick={() => toggleCompare(selectedCandidate.id)}><Scale size={18} /></ActionIcon>
              <ActionIcon variant="light" color="gray" onClick={() => shareCandidate(selectedCandidate)}><Share2 size={18} /></ActionIcon>
            </Group>
            {selectedRanking && <Badge color="indigo" size="lg">Rank #{selectedRanking.rank}</Badge>}
          </Stack>
        </Group>

        <Title order={3}>{selectedCandidate.name}</Title>
        <Text c="indigo" fw={700} size="sm" mb="xs">{selectedCandidate.role}</Text>
        <Group gap="lg" mb="xl">
          <Group gap={4}><Target size={14} className="text-gray-400" /><Text size="xs" fw={700} c="dimmed">{selectedCandidate.experienceYears}Y EXP</Text></Group>
          <Group gap={4}><Users2 size={14} className="text-gray-400" /><Text size="xs" fw={700} c="dimmed">HIGH YIELD</Text></Group>
        </Group>

        <Divider my="lg" label={<Text size="xs" fw={900} tt="uppercase" c="dimmed">Neural Benchmarks</Text>} labelPosition="center" />

        {selectedEvaluation ? (
          <Box mb="xl">
            <ScoreBar label="Crisis Response" score={selectedEvaluation.crisisManagementScore} icon={ShieldAlert} color="text-rose-500" />
            <ScoreBar label="Sustainability" score={selectedEvaluation.sustainabilityScore} icon={Leaf} color="text-teal-500" />
            <ScoreBar label="Motivation" score={selectedEvaluation.teamMotivationScore} icon={Users2} color="text-indigo-500" />
          </Box>
        ) : (
          <Paper p="md" mb="xl" radius="md" bg={computedColorScheme === 'dark' ? 'dark.8' : 'gray.0'} withBorder style={{ borderStyle: 'dashed' }}>
            <Text size="xs" ta="center" c="dimmed" fs="italic">No neural vectors generated for this profile yet.</Text>
          </Paper>
        )}

        <Box h={220} mb="xl">
          <ResponsiveContainer width="100%" height="100%">
            <RadarChart cx="50%" cy="50%" outerRadius="70%" data={radarData}>
              <PolarGrid stroke={computedColorScheme === 'dark' ? '#373a40' : '#e2e8f0'} />
              <PolarAngleAxis dataKey="subject" tick={{ fill: '#94a3b8', fontSize: 10, fontWeight: 700 }} />
              <Radar name={selectedCandidate.name} dataKey="A" stroke="#6366f1" fill="#6366f1" fillOpacity={0.1} />
            </RadarChart>
          </ResponsiveContainer>
        </Box>

        <Paper p="md" radius="md" bg="indigo.6" c="white" shadow="sm" mb="xl">
          <Group gap={6} mb={4}><Zap size={14} className="text-yellow-300" /><Text size="xs" fw={900} tt="uppercase">Neural Verdict</Text></Group>
          <Text size="xs" fw={500} fs="italic" style={{ lineHeight: 1.5 }}>
            "{selectedEvaluation?.summary || 'Trigger a neural evaluation to generate insights based on professional history.'}"
          </Text>
        </Paper>

        <Divider my="xl" label={<Text size="xs" fw={900} tt="uppercase" c="dimmed">Private Recruiter Notes</Text>} labelPosition="center" />
        
        <Box mb="xl">
          <Textarea
            placeholder="Add internal notes about this candidate..."
            minRows={3}
            maxRows={6}
            value={candidateNotes[selectedCandidate.id] || ''}
            onChange={(e) => handleNoteChange(selectedCandidate.id, e.currentTarget.value)}
            leftSection={<StickyNote size={16} style={{ marginBottom: 'auto', marginTop: '8px' }} />}
            leftSectionProps={{ style: { alignItems: 'flex-start' } }}
            styles={{
              input: {
                fontSize: '12px',
                backgroundColor: computedColorScheme === 'dark' ? 'var(--mantine-color-dark-8)' : 'var(--mantine-color-yellow-0)',
                borderColor: computedColorScheme === 'dark' ? 'var(--mantine-color-dark-4)' : 'var(--mantine-color-yellow-2)',
                color: computedColorScheme === 'dark' ? 'var(--mantine-color-dark-0)' : 'var(--mantine-color-yellow-9)',
              }
            }}
          />
          <Text size="10px" c="dimmed" mt={5} ta="right">Notes are saved locally to your device.</Text>
        </Box>

        <Button 
          fullWidth 
          size="md" 
          radius="md" 
          leftSection={<BrainCircuit size={18} />}
          onClick={() => runAIEvaluation(selectedCandidate.id)}
          loading={isEvaluating === selectedCandidate.id}
          variant="gradient"
          gradient={{ from: 'indigo', to: 'cyan' }}
        >
          {isEvaluating === selectedCandidate.id ? 'Processing...' : 'Neural Evaluation'}
        </Button>
      </Paper>
    );
  };

  const NavButton = ({ label, icon: Icon, id }: { label: string, icon: any, id: Page }) => (
    <Button 
      variant={activePage === id ? 'filled' : 'subtle'} 
      color={activePage === id ? 'indigo' : 'gray'}
      fullWidth 
      justify="flex-start" 
      leftSection={<Icon size={18} />}
      onClick={() => setActivePage(id)}
      radius="md"
      mb={4}
    >
      {label}
    </Button>
  );

  const SettingsView = () => (
    <Container size="md" py="xl">
      <Stack gap="xl">
        <Box>
          <Title order={2} mb="xs">System Settings</Title>
          <Text c="dimmed" size="sm">Manage your recruitment dashboard configuration and AI preferences.</Text>
        </Box>

        <Paper p="xl" radius="md" withBorder>
          <Group gap="xs" mb="lg">
            <Monitor size={20} className="text-indigo-600" />
            <Title order={4}>Appearance</Title>
          </Group>
          
          <Stack gap="md">
            <Box>
              <Group justify="space-between" mb={8}>
                <div>
                  <Text fw={600}>Visual Theme</Text>
                  <Text size="xs" c="dimmed">Choose how CandidateAI looks on your device.</Text>
                </div>
                <SegmentedControl
                  value={colorScheme}
                  onChange={(value) => setColorScheme(value as any)}
                  data={[
                    { label: <Group gap={6}><Sun size={14}/> Light</Group>, value: 'light' },
                    { label: <Group gap={6}><Moon size={14}/> Dark</Group>, value: 'dark' },
                    { label: <Group gap={6}><Monitor size={14}/> Auto</Group>, value: 'auto' },
                  ]}
                />
              </Group>
            </Box>
          </Stack>
        </Paper>

        <Paper p="xl" radius="md" withBorder>
          <Group gap="xs" mb="lg">
            <BrainCircuit size={20} className="text-indigo-600" />
            <Title order={4}>AI Intelligence</Title>
          </Group>
          
          <Stack gap="xl">
            <Box>
              <Group justify="space-between" align="flex-start">
                <Box style={{ flex: 1 }}>
                  <Text fw={600}>Primary Inference Model</Text>
                  <Text size="xs" c="dimmed">Select the Gemini model for neural benchmarking. Pro models offer higher reasoning depth.</Text>
                </Box>
                <Select 
                  data={AI_MODELS} 
                  value={settings.model} 
                  onChange={(val) => setSettings(prev => ({ ...prev, model: val || 'gemini-3-flash-preview' }))}
                  size="sm"
                  w={280}
                  leftSection={<Sparkles size={14} className="text-indigo-500" />}
                />
              </Group>
            </Box>

            <Divider variant="dashed" />

            <Group justify="space-between">
              <div>
                <Text fw={600}>Auto-Neural Profiling</Text>
                <Text size="xs" c="dimmed">Automatically trigger AI assessment when a new candidate is viewed.</Text>
              </div>
              <Switch 
                checked={settings.autoEval} 
                onChange={(e) => setSettings(prev => ({ ...prev, autoEval: e.currentTarget.checked }))}
                color="indigo"
              />
            </Group>
          </Stack>
        </Paper>

        <Paper p="xl" radius="md" withBorder style={{ borderStyle: 'solid', borderColor: 'var(--mantine-color-red-2)' }}>
          <Group gap={6} mb="lg">
            <Trash2 size={20} className="text-red-600" />
            <Title order={4} c="red">Danger Zone</Title>
          </Group>
          
          <Group justify="space-between">
            <div>
              <Text fw={600}>Reset All Data</Text>
              <Text size="xs" c="dimmed">Wipe all current AI evaluations, private notes, and restore mock datasets.</Text>
            </div>
            <Button variant="outline" color="red" leftSection={<RefreshCw size={14} />} onClick={resetAllData}>
              Factory Reset
            </Button>
          </Group>
        </Paper>
      </Stack>
    </Container>
  );

  return (
    <AppShell
      header={{ height: 70 }}
      navbar={{ width: 260, breakpoint: 'sm' }}
      padding="xl"
    >
      <AppShell.Header p="md">
        <Group justify="space-between" h="100%">
          <Group>
            <ThemeIcon size="lg" radius="md" color="indigo" variant="gradient" gradient={{ from: 'indigo', to: 'cyan' }}>
              <BrainCircuit size={22} />
            </ThemeIcon>
            <Title order={4}>CandidateAI</Title>
          </Group>
          <Group visibleFrom="sm">
            <TextInput 
              placeholder="Quick search..." 
              size="xs" 
              leftSection={<Search size={14} />} 
              w={300}
              radius="md"
            />
            <ActionIcon 
              variant="outline" 
              color={computedColorScheme === 'dark' ? 'yellow' : 'gray'} 
              onClick={toggleColorScheme} 
              title="Toggle color scheme"
              radius="md"
              size="lg"
            >
              {computedColorScheme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
            </ActionIcon>
            <ActionIcon variant="light" color="gray" radius="md" size="lg" onClick={() => setActivePage('settings')}><SettingsIcon size={20} /></ActionIcon>
          </Group>
        </Group>
      </AppShell.Header>

      <AppShell.Navbar p="md">
        <NavButton label="Overview" icon={LayoutDashboard} id="dashboard" />
        <NavButton label="Talent Pool" icon={Users} id="candidates" />
        <NavButton label="Rankings" icon={Trophy} id="rankings" />
        <NavButton label="Comparison" icon={Scale} id="comparison" />
        <NavButton label="Settings" icon={SettingsIcon} id="settings" />
        
        <Box 
          mt="auto" 
          p="md" 
          style={{ 
            borderRadius: 'var(--mantine-radius-md)', 
            backgroundColor: computedColorScheme === 'dark' ? 'var(--mantine-color-dark-6)' : 'var(--mantine-color-gray-1)' 
          }}
        >
          <Text size="xs" fw={900} tt="uppercase" c="dimmed" mb={5}>Campaign Health</Text>
          <Text size="xs" fw={700} mb={10}>Q4 Sourcing Drive</Text>
          <Progress value={75} color="indigo" size="sm" radius="xl" />
        </Box>
      </AppShell.Navbar>

      <AppShell.Main bg={computedColorScheme === 'dark' ? 'dark.9' : 'gray.0'}>
        <Container size="xl">
          {activePage === 'dashboard' && <DashboardView />}
          {activePage === 'candidates' && <CandidatesView />}
          {activePage === 'rankings' && (
             <Paper p="xl" radius="md" withBorder>
               <Title order={3} mb="xl">Global Talent Leaderboard</Title>
               <Table verticalSpacing="md" style={{ fontSize: 'var(--mantine-font-size-sm)' }}>
                 <Table.Thead>
                   <Table.Tr>
                     <Table.Th>Pos</Table.Th>
                     <Table.Th>Candidate</Table.Th>
                     <Table.Th>Crisis</Table.Th>
                     <Table.Th>Sustainability</Table.Th>
                     <Table.Th>Motivation</Table.Th>
                     <Table.Th ta="center">Neural Avg</Table.Th>
                   </Table.Tr>
                 </Table.Thead>
                 <Table.Tbody>
                   {rankings.map(r => {
                     const c = candidates.find(cand => cand.id === r.candidateId)!;
                     const e = evaluations.find(ev => ev.candidateId === r.candidateId);
                     return (
                       <Table.Tr key={r.candidateId} onClick={() => { setSelectedCandidateId(c.id); setActivePage('dashboard'); }} style={{ cursor: 'pointer' }}>
                         <Table.Td><Badge color={r.rank === 1 ? 'yellow' : 'gray'} variant="light">{r.rank}</Badge></Table.Td>
                         <Table.Td>
                           <Group gap="sm">
                             <Avatar src={c.avatar} size="sm" radius="xl" />
                             <Text fw={700} size="xs">{c.name}</Text>
                           </Group>
                         </Table.Td>
                         <Table.Td><Badge variant="outline" color="rose">{e?.crisisManagementScore.toFixed(0)}%</Badge></Table.Td>
                         <Table.Td><Badge variant="outline" color="teal">{e?.sustainabilityScore.toFixed(0)}%</Badge></Table.Td>
                         <Table.Td><Badge variant="outline" color="indigo">{e?.teamMotivationScore.toFixed(0)}%</Badge></Table.Td>
                         <Table.Td ta="center"><Text fw={900} c="indigo">{r.totalScore.toFixed(1)}</Text></Table.Td>
                       </Table.Tr>
                     );
                   })}
                 </Table.Tbody>
               </Table>
             </Paper>
          )}
          {activePage === 'settings' && <SettingsView />}
          {activePage === 'comparison' && (
            <Box>
              <Group justify="space-between" mb="xl">
                <Button variant="subtle" leftSection={<X size={16} />} onClick={() => setActivePage('candidates')}>Back to Pool</Button>
                <Title order={3}>Comparison Matrix</Title>
              </Group>
              <ScrollArea>
                <Group gap="xl" wrap="nowrap" pb="xl">
                  {candidates.filter(c => compareIds.includes(c.id)).map(candidate => (
                    <Paper key={candidate.id} w={350} p="lg" radius="md" withBorder>
                      <Stack align="center" mb="lg">
                        <Avatar src={candidate.avatar} size={100} radius="xl" />
                        <Title order={4}>{candidate.name}</Title>
                        <Text size="xs" c="indigo" fw={700} tt="uppercase">{candidate.role}</Text>
                      </Stack>
                      <Divider mb="lg" />
                      <Stack gap="md">
                        {evaluations.find(e => e.candidateId === candidate.id) ? (
                          <>
                            <ScoreBar label="Crisis" score={evaluations.find(e => e.candidateId === candidate.id)!.crisisManagementScore} icon={ShieldAlert} color="text-rose-500" />
                            <ScoreBar label="Green" score={evaluations.find(e => e.candidateId === candidate.id)!.sustainabilityScore} icon={Leaf} color="text-teal-500" />
                            <ScoreBar label="Motiv" score={evaluations.find(e => e.candidateId === candidate.id)!.teamMotivationScore} icon={Users2} color="text-indigo-500" />
                          </>
                        ) : <Text ta="center" size="xs" c="dimmed" fs="italic">No analysis</Text>}
                        <Button color="red" variant="subtle" size="xs" onClick={() => toggleCompare(candidate.id)}>Remove</Button>
                      </Stack>
                    </Paper>
                  ))}
                </Group>
              </ScrollArea>
            </Box>
          )}
        </Container>
      </AppShell.Main>
    </AppShell>
  );
};

const App: React.FC = () => (
  <MantineProvider defaultColorScheme="auto">
    <AppContent />
  </MantineProvider>
);

export default App;
