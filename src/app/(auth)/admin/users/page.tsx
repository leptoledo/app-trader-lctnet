"use client"

import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabase"
import { Button } from "@/components/ui/button"
import { AlertTriangle, UserCheck, Shield, ShieldAlert, BadgeCheck, Ban, Zap, Clock, Crown, CircleCheck } from "lucide-react"
import { toast } from "sonner"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import { updateUserRoleAction, fetchUsersAdminAction, toggleUserBanAction } from "@/app/actions/adminAction"

export default function UsersAdminPage() {
    const [users, setUsers] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [actionUser, setActionUser] = useState<any | null>(null)
    const [actionType, setActionType] = useState<'promote' | 'demote' | 'ban' | 'unban' | null>(null)

    useEffect(() => {
        fetchUsers()
    }, [])

    const fetchUsers = async () => {
        setLoading(true)
        const sessionData = await supabase.auth.getSession()
        const accessToken = sessionData.data.session?.access_token || null

        const result = await fetchUsersAdminAction(accessToken)

        if (!result.success) {
            toast.error(result.error || "Erro ao carregar usuários")
        } else {
            setUsers(result.users)
        }
        setLoading(false)
    }

    const handleActionConfirm = async () => {
        if (!actionUser || !actionType) return

        setLoading(true)
        const sessionData = await supabase.auth.getSession()
        const accessToken = sessionData.data.session?.access_token || null

        if (actionType === 'promote' || actionType === 'demote') {
            const newRole = actionType === 'promote' ? 'admin' : 'user'
            const result = await updateUserRoleAction(actionUser.id, newRole, accessToken)

            if (!result.success) {
                toast.error(result.error || "Erro ao atualizar permissões do usuário.")
            } else {
                toast.success(result.message)
                setUsers(users.map(u => u.id === actionUser.id ? { ...u, role: newRole } : u))
            }
        } 
        else if (actionType === 'ban' || actionType === 'unban') {
            const isBanned = actionType === 'ban'
            const result = await toggleUserBanAction(actionUser.id, isBanned, accessToken)
            
            if (!result.success) {
                toast.error(result.error || "Erro ao alterar banimento do usuário.")
            } else {
                toast.success(result.message)
                setUsers(users.map(u => u.id === actionUser.id ? { ...u, settings: { ...(u.settings || {}), is_banned: isBanned } } : u))
            }
        }

        setActionUser(null)
        setActionType(null)
        setLoading(false)
    }

    return (
        <div className="p-6 md:p-8 space-y-8 animate-in fade-in max-w-7xl mx-auto">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">Gestão de Usuários</h1>
                    <p className="text-slate-500 dark:text-slate-400 mt-2">Visualize os usuários cadastrados e gerencie permissões de acesso ao Admin.</p>
                </div>
            </div>

            {loading ? (
                <div className="flex items-center justify-center p-12">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-500"></div>
                </div>
            ) : users.length === 0 ? (
                <div className="text-center p-12 border border-dashed border-slate-200 dark:border-slate-800 rounded-2xl">
                    <p className="text-slate-500 dark:text-slate-400">Nenhum usuário encontrado na tabela profiles.</p>
                </div>
            ) : (
                <div className="bg-white dark:bg-[#111827] rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm">
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left">
                            <thead className="text-xs text-slate-500 bg-slate-50 dark:bg-slate-800/50 dark:text-slate-400 uppercase border-b border-slate-200 dark:border-slate-800">
                                <tr>
                                    <th className="px-6 py-4 font-medium">Usuário</th>
                                    <th className="px-6 py-4 font-medium">ID (Supabase)</th>
                                    <th className="px-6 py-4 font-medium">Permissão</th>
                                    <th className="px-6 py-4 font-medium">Plano</th>
                                    <th className="px-6 py-4 font-medium">Data de Cadastro</th>
                                    <th className="px-6 py-4 font-medium text-right">Ações</th>
                                </tr>
                            </thead>
                            <tbody>
                                {users.map(user => (
                                    <tr key={user.id} className="border-b border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                                        <td className="px-6 py-4 font-medium text-slate-900 dark:text-white">
                                            {user.username || 'Sem nome definido'}
                                        </td>
                                        <td className="px-6 py-4 text-slate-500 font-mono text-xs">
                                            {user.id.substring(0, 8)}...
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${user.role === 'admin'
                                                    ? 'bg-purple-100 text-purple-700 dark:bg-purple-500/10 dark:text-purple-400'
                                                    : 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300'
                                                }`}>
                                                {user.role === 'admin' ? <ShieldAlert className="h-3 w-3" /> : <UserCheck className="h-3 w-3" />}
                                                {user.role === 'admin' ? 'Administrador' : 'Usuário'}
                                            </span>
                                            {user.settings?.is_banned && (
                                                <span className="ml-2 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-red-100 text-red-700 dark:bg-red-500/10 dark:text-red-400">
                                                    <Ban className="h-3 w-3" />
                                                    Banido
                                                </span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4">
                                            {user.subscription?.plan === 'free' ? (
                                                <span className="inline-flex items-center gap-1 text-slate-500 dark:text-slate-400"><CircleCheck className="h-3.5 w-3.5" /> Gratuito</span>
                                            ) : user.subscription?.plan === 'pro' ? (
                                                <span className="inline-flex items-center gap-1 text-blue-600 dark:text-blue-400 font-medium"><Zap className="h-3.5 w-3.5" /> PRO {user.subscription?.status === 'trialing' ? '(Trial)' : ''}</span>
                                            ) : (
                                                <span className="inline-flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-medium"><Crown className="h-3.5 w-3.5" /> Ouro {user.subscription?.status === 'trialing' ? '(Trial)' : ''}</span>
                                            )}
                                            {user.subscription?.status === 'past_due' && <span className="ml-1 text-xs text-red-500">(Atrasado)</span>}
                                            {user.subscription?.status === 'canceled' && <span className="ml-1 text-xs text-slate-400">(Cancelado)</span>}
                                        </td>
                                        <td className="px-6 py-4 text-slate-500">
                                            {new Date(user.created_at).toLocaleDateString('pt-BR')}
                                        </td>
                                        <td className="px-6 py-4 text-right space-x-2">
                                            {user.role === 'admin' ? (
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    className="text-amber-600 hover:text-amber-700 hover:bg-amber-50 dark:hover:bg-amber-500/10 border-amber-200 dark:border-amber-900/50"
                                                    onClick={() => { setActionUser(user); setActionType('demote') }}
                                                >
                                                    <Shield className="h-4 w-4 mr-2" /> Remover Admin
                                                </Button>
                                            ) : (
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    className="text-purple-600 hover:text-purple-700 hover:bg-purple-50 dark:hover:bg-purple-500/10 border-purple-200 dark:border-purple-900/50"
                                                    onClick={() => { setActionUser(user); setActionType('promote') }}
                                                >
                                                    <BadgeCheck className="h-4 w-4 mr-2" /> Tornar Admin
                                                </Button>
                                            )}
                                            
                                            {user.role !== 'admin' && (
                                                user.settings?.is_banned ? (
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        className="text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 dark:hover:bg-emerald-500/10 border-emerald-200 dark:border-emerald-900/50"
                                                        onClick={() => { setActionUser(user); setActionType('unban') }}
                                                    >
                                                        <UserCheck className="h-4 w-4" />
                                                    </Button>
                                                ) : (
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        className="text-rose-600 hover:text-rose-700 hover:bg-rose-50 dark:hover:bg-rose-500/10 border-rose-200 dark:border-rose-900/50"
                                                        onClick={() => { setActionUser(user); setActionType('ban') }}
                                                    >
                                                        <Ban className="h-4 w-4" />
                                                    </Button>
                                                )
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            <Dialog open={!!actionUser} onOpenChange={(open) => !open && setActionUser(null)}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            {actionType === 'promote' && (
                                <><BadgeCheck className="h-5 w-5 text-purple-500" /> Promover a Administrador</>
                            )}
                            {actionType === 'demote' && (
                                <><AlertTriangle className="h-5 w-5 text-amber-500" /> Remover Privilégios</>
                            )}
                            {actionType === 'ban' && (
                                <><Ban className="h-5 w-5 text-rose-500" /> Banir Usuário</>
                            )}
                            {actionType === 'unban' && (
                                <><UserCheck className="h-5 w-5 text-emerald-500" /> Restaurar Acesso</>
                            )}
                        </DialogTitle>
                        <DialogDescription className="pt-2 text-slate-600 dark:text-slate-400">
                            {actionType === 'promote' && `Tem certeza que deseja promover ${actionUser?.username || 'este usuário'} a Administrador? Ele terá acesso total a todas as rotas do painel /admin.`}
                            {actionType === 'demote' && `Tem certeza que deseja remover os privilégios de Administrador de ${actionUser?.username || 'este usuário'}? Ele perderá acesso ao painel.`}
                            {actionType === 'ban' && `Banir ${actionUser?.username || 'este usuário'} irá revogar seu acesso à plataforma. Ele não conseguirá mais logar nem acessar métricas. Confirma?`}
                            {actionType === 'unban' && `Deseja remover o banimento de ${actionUser?.username || 'este usuário'} e restaurar seu acesso normal?`}
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter className="mt-6">
                        <Button variant="outline" onClick={() => { setActionUser(null); setActionType(null) }} disabled={loading}>
                            Cancelar
                        </Button>
                        <Button
                            onClick={handleActionConfirm}
                            disabled={loading}
                            className={
                                actionType === 'promote' ? "bg-purple-600 hover:bg-purple-700 text-white" :
                                actionType === 'demote' ? "bg-amber-600 hover:bg-amber-700 text-white" :
                                actionType === 'ban' ? "bg-rose-600 hover:bg-rose-700 text-white" :
                                "bg-emerald-600 hover:bg-emerald-700 text-white"
                            }
                        >
                            {loading ? "Processando..." : (
                                actionType === 'promote' ? "Sim, conceder acesso" : 
                                actionType === 'demote' ? "Sim, revogar acesso" :
                                actionType === 'ban' ? "Sim, banir usuário" :
                                "Sim, restaurar acesso"
                            )}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    )
}
