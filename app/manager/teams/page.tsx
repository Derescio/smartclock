import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { redirect } from "next/navigation"
import { getOrganizationTeams, getTeamStats } from "@/actions/teams"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"
import { ArrowLeftIcon, UsersIcon, PlusIcon, UserIcon, SettingsIcon } from "lucide-react"
import { Team, TeamMember } from "@/types/teams"

export default async function TeamsPage() {
    const session = await getServerSession(authOptions)

    if (!session?.user) {
        redirect("/login")
    }

    if (session.user.role !== "MANAGER" && session.user.role !== "ADMIN" && session.user.role !== "SUPER_ADMIN") {
        redirect("/dashboard")
    }

    // Get teams and stats
    const [teamsResult, statsResult] = await Promise.all([
        getOrganizationTeams(),
        getTeamStats()
    ])

    const teams = teamsResult.success ? teamsResult.teams : []
    const stats = statsResult.success ? statsResult.stats : {
        totalTeams: 0,
        activeTeams: 0,
        totalMembers: 0,
        avgTeamSize: 0
    }

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <div className="bg-white border-b">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between h-16">
                        <div className="flex items-center space-x-4">
                            <Link
                                href="/manager"
                                className="flex items-center text-gray-500 hover:text-gray-900 text-sm font-medium transition-colors"
                            >
                                <ArrowLeftIcon className="h-4 w-4 mr-2" />
                                Back to Dashboard
                            </Link>
                            <div className="h-6 border-l border-gray-300" />
                            <h1 className="text-xl font-semibold text-gray-900 flex items-center">
                                <UsersIcon className="h-5 w-5 mr-2 text-blue-600" />
                                Team Management
                            </h1>
                        </div>
                        <Button asChild>
                            <Link href="/manager/teams/create">
                                <PlusIcon className="h-4 w-4 mr-2" />
                                Create Team
                            </Link>
                        </Button>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                    <Card>
                        <CardContent className="p-6">
                            <div className="flex items-center">
                                <div className="flex-shrink-0">
                                    <UsersIcon className="h-8 w-8 text-blue-600" />
                                </div>
                                <div className="ml-4">
                                    <div className="text-2xl font-bold text-gray-900">{stats?.totalTeams ?? 0}</div>
                                    <div className="text-sm text-gray-600">Total Teams</div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardContent className="p-6">
                            <div className="flex items-center">
                                <div className="flex-shrink-0">
                                    <UsersIcon className="h-8 w-8 text-green-600" />
                                </div>
                                <div className="ml-4">
                                    <div className="text-2xl font-bold text-gray-900">{stats?.activeTeams ?? 0}</div>
                                    <div className="text-sm text-gray-600">Active Teams</div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardContent className="p-6">
                            <div className="flex items-center">
                                <div className="flex-shrink-0">
                                    <UsersIcon className="h-8 w-8 text-purple-600" />
                                </div>
                                <div className="ml-4">
                                    <div className="text-2xl font-bold text-gray-900">{stats?.totalMembers ?? 0}</div>
                                    <div className="text-sm text-gray-600">Team Members</div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardContent className="p-6">
                            <div className="flex items-center">
                                <div className="flex-shrink-0">
                                    <UsersIcon className="h-8 w-8 text-orange-600" />
                                </div>
                                <div className="ml-4">
                                    <div className="text-2xl font-bold text-gray-900">{stats?.avgTeamSize ?? 0}</div>
                                    <div className="text-sm text-gray-600">Avg Team Size</div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Teams Section */}
                <Card>
                    <CardHeader>
                        <CardTitle>All Teams</CardTitle>
                        <p className="text-sm text-gray-600">
                            Create and manage teams to make schedule assignment easier. Teams allow you to group employees for bulk scheduling.
                        </p>
                    </CardHeader>
                    <CardContent>
                        {(teams?.length ?? 0) === 0 ? (
                            <div className="text-center py-12">
                                <UsersIcon className="mx-auto h-12 w-12 text-gray-400" />
                                <h3 className="mt-2 text-sm font-medium text-gray-900">No teams found</h3>
                                <p className="mt-1 text-sm text-gray-500">
                                    Get started by creating your first team to group employees for easier schedule management.
                                </p>
                                <div className="mt-6">
                                    <Button asChild>
                                        <Link href="/manager/teams/create">
                                            <PlusIcon className="h-4 w-4 mr-2" />
                                            Create Your First Team
                                        </Link>
                                    </Button>
                                </div>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {teams?.map((team: Team) => (
                                    <Card key={team.id} className="hover:shadow-md transition-shadow">
                                        <CardContent className="p-6">
                                            <div className="flex items-start justify-between mb-4">
                                                <div className="flex items-center space-x-3">
                                                    <div
                                                        className="w-4 h-4 rounded-full"
                                                        style={{ backgroundColor: team.color || '#6B7280' }}
                                                    />
                                                    <h3 className="text-lg font-semibold text-gray-900">{team.name}</h3>
                                                </div>
                                                <Button variant="ghost" size="sm">
                                                    <SettingsIcon className="h-4 w-4" />
                                                </Button>
                                            </div>

                                            {team.description && (
                                                <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                                                    {team.description}
                                                </p>
                                            )}

                                            <div className="space-y-3">
                                                {team.manager && (
                                                    <div className="flex items-center space-x-2">
                                                        <UserIcon className="h-4 w-4 text-gray-400" />
                                                        <span className="text-sm text-gray-600">Manager:</span>
                                                        <span className="text-sm font-medium">
                                                            {team.manager.name || team.manager.email}
                                                        </span>
                                                    </div>
                                                )}

                                                <div className="flex items-center justify-between">
                                                    <div className="flex items-center space-x-2">
                                                        <UsersIcon className="h-4 w-4 text-gray-400" />
                                                        <span className="text-sm text-gray-600">
                                                            {team._count.members} member{team._count.members !== 1 ? 's' : ''}
                                                        </span>
                                                    </div>
                                                    <Badge variant="outline" className="text-xs">
                                                        Active
                                                    </Badge>
                                                </div>

                                                {team.members.length > 0 && (
                                                    <div className="flex flex-wrap gap-1 mt-2">
                                                        {team.members.slice(0, 3).map((member: TeamMember) => (
                                                            <Badge key={member.id} variant="secondary" className="text-xs">
                                                                {member.user.name || member.user.email.split('@')[0]}
                                                            </Badge>
                                                        ))}
                                                        {team.members.length > 3 && (
                                                            <Badge variant="secondary" className="text-xs">
                                                                +{team.members.length - 3} more
                                                            </Badge>
                                                        )}
                                                    </div>
                                                )}
                                            </div>
                                        </CardContent>
                                    </Card>
                                ))}
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Feature Information */}
                {(teams?.length ?? 0) === 0 && (
                    <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-6">
                        <div className="flex">
                            <div className="flex-shrink-0">
                                <UsersIcon className="h-5 w-5 text-blue-600" />
                            </div>
                            <div className="ml-3">
                                <h3 className="text-sm font-medium text-blue-800">
                                    Teams Feature Benefits
                                </h3>
                                <div className="mt-2 text-sm text-blue-700">
                                    <p>
                                        The teams feature allows you to:
                                    </p>
                                    <ul className="mt-2 list-disc list-inside space-y-1">
                                        <li>Group employees into teams for easier management</li>
                                        <li>Assign schedules to entire teams at once</li>
                                        <li>Set team managers and hierarchies</li>
                                        <li>Track team performance and schedules</li>
                                    </ul>
                                    <p className="mt-3">
                                        You can also assign schedules to individual employees, departments, or locations.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
} 