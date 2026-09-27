import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Briefcase,
  FileCheck2,
  Users2,
  Share2,
  Network,
  ShieldAlert,
  Clock,
  ShieldCheck,
  FileSpreadsheet,
  Settings,
  LogOut,
  ChevronLeft,
  ChevronRight,
  X,
  Building2,
  FolderOpen
} from 'lucide-react';
import { useInvestigation } from '../../context/InvestigationContext';
import { useAuth } from '../../context/AuthContext';
import SanketLogo from '../common/SanketLogo';

export default function Sidebar({
  collapsed = false,
  onToggleCollapse,
  mobile = false,
  onNavigate,
}) {
  const { currentCaseId, currentCase } = useInvestigation();
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const baseCasePath = currentCaseId ? `/cases/${encodeURIComponent(currentCaseId)}` : '/cases';

  const navItems = [
    {
      name: 'Dashboard',
      path: '/dashboard',
      icon: LayoutDashboard,
      disabled: false,
      section: 'MAIN'
    },
    {
      name: 'Investigations',
      path: '/cases',
      icon: Briefcase,
      disabled: false,
      section: 'MAIN'
    },
    {
      name: 'Evidence',
      path: currentCaseId ? `${baseCasePath}/evidence` : '/cases',
      icon: FileCheck2,
      disabled: !currentCaseId,
      section: 'CASE WORKSPACE'
    },
    {
      name: 'Entities',
      path: currentCaseId ? `${baseCasePath}/entities` : '/cases',
      icon: Users2,
      disabled: !currentCaseId,
      section: 'CASE WORKSPACE'
    },
    {
      name: 'Relationships',
      path: currentCaseId ? `${baseCasePath}/relationships` : '/cases',
      icon: Share2,
      disabled: !currentCaseId,
      section: 'CASE WORKSPACE'
    },
    {
      name: 'Investigation Graph',
      path: currentCaseId ? `${baseCasePath}/graph` : '/cases',
      icon: Network,
      disabled: !currentCaseId,
      section: 'INTELLIGENCE'
    },
    {
      name: 'Risk Analysis',
      path: currentCaseId ? `${baseCasePath}/risk` : '/cases',
      icon: ShieldAlert,
      disabled: !currentCaseId,
      section: 'INTELLIGENCE'
    },
    {
      name: 'Timeline',
      path: currentCaseId ? `${baseCasePath}/timeline` : '/cases',
      icon: Clock,
      disabled: !currentCaseId,
      section: 'INTELLIGENCE'
    },
    {
      name: 'Integrity',
      path: currentCaseId ? `${baseCasePath}/integrity` : '/cases',
      icon: ShieldCheck,
      disabled: !currentCaseId,
      section: 'FORENSICS'
    },
    {
      name: 'Reports',
      path: currentCaseId ? `${baseCasePath}/report` : '/cases',
      icon: FileSpreadsheet,
      disabled: !currentCaseId,
      section: 'FORENSICS'
    },
  ];

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const getInitials = (name) => {
    if (!name) return 'OF';
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .substring(0, 2)
      .toUpperCase();
  };

  return (
    <aside
      className={`h-full bg-white border-r border-slate-200/90 flex flex-col select-none transition-all duration-200 ${
        mobile
          ? 'w-full'
          : collapsed
          ? 'w-[72px]'
          : 'w-64'
      }`}
    >
      {/* Brand Header */}
      <div className="h-16 px-4 flex items-center justify-between border-b border-slate-200/80 shrink-0">
        {!collapsed ? (
          <div
            onClick={() => {
              navigate('/dashboard');
              if (onNavigate) onNavigate();
            }}
            className="cursor-pointer"
          >
            <SanketLogo variant="full" theme="light" size="md" />
          </div>
        ) : (
          <div
            onClick={() => {
              navigate('/dashboard');
              if (onNavigate) onNavigate();
            }}
            className="cursor-pointer mx-auto"
            title="SanketAI"
          >
            <SanketLogo variant="icon" theme="light" size="sm" />
          </div>
        )}

        {mobile && (
          <button
            type="button"
            onClick={onNavigate}
            className="p-1 rounded-md text-slate-400 hover:text-slate-700 hover:bg-slate-100"
            aria-label="Close menu"
          >
            <X className="w-5 h-5" />
          </button>
        )}

        {!mobile && onToggleCollapse && (
          <button
            type="button"
            onClick={onToggleCollapse}
            className={`p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors ${
              collapsed ? 'hidden' : 'block'
            }`}
            title="Collapse sidebar"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Active Case Context Pill (if open) */}
      {!collapsed && currentCase && (
        <div className="mx-3 mt-3 px-3 py-2 rounded-xl bg-blue-50/70 border border-blue-100/90 text-xs">
          <div className="flex items-center gap-1.5 text-blue-700 font-semibold mb-0.5">
            <FolderOpen className="w-3.5 h-3.5 shrink-0" />
            <span className="truncate">Active Case</span>
          </div>
          <p className="font-mono text-[11px] font-semibold text-slate-800 truncate">
            {currentCase.case_number}
          </p>
          <p className="text-[11px] text-slate-500 truncate">
            {currentCase.title}
          </p>
        </div>
      )}

      {/* Nav List */}
      <div className="flex-1 overflow-y-auto px-3 py-3 space-y-1">
        {navItems.map((item, idx) => {
          const Icon = item.icon;

          if (item.disabled) {
            return (
              <div
                key={idx}
                className={`flex items-center gap-3 rounded-lg px-2.5 py-2 text-xs font-medium text-slate-400 opacity-50 cursor-not-allowed select-none ${
                  collapsed ? 'justify-center' : ''
                }`}
                title={collapsed ? `${item.name} (Select case first)` : undefined}
              >
                <Icon className="w-4 h-4 shrink-0" />
                {!collapsed && <span className="truncate">{item.name}</span>}
              </div>
            );
          }

          return (
            <NavLink
              key={idx}
              to={item.path}
              end={item.path === '/cases' || item.path === '/dashboard'}
              onClick={onNavigate}
              title={collapsed ? item.name : undefined}
              className={({ isActive }) =>
                `flex items-center gap-3 rounded-lg px-2.5 py-2 text-xs font-semibold transition-all duration-150 ${
                  collapsed ? 'justify-center' : ''
                } ${
                  isActive
                    ? 'bg-blue-50 text-blue-600 shadow-sm border border-blue-100/60'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/80'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-blue-600' : 'text-slate-500'}`} />
                  {!collapsed && <span className="truncate">{item.name}</span>}
                </>
              )}
            </NavLink>
          );
        })}
      </div>

      {/* Footer / User Profile & Logout */}
      <div className="border-t border-slate-200/80 p-3 bg-slate-50/60 shrink-0">
        {!collapsed ? (
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-8 h-8 rounded-full bg-slate-900 text-white font-bold text-xs flex items-center justify-center shrink-0 shadow-sm">
                {getInitials(user?.full_name)}
              </div>
              <div className="min-w-0 flex-1">
                <div className="text-xs font-bold text-slate-900 truncate">
                  {user?.full_name || 'Investigator'}
                </div>
                <div className="text-[10px] text-slate-500 font-mono truncate flex items-center gap-1">
                  <span>{user?.officer_id || 'ID-001'}</span>
                  <span>·</span>
                  <span className="truncate">{user?.department || 'Cyber Unit'}</span>
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={handleLogout}
              className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors"
              title="Logout"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-2">
            <div
              className="w-8 h-8 rounded-full bg-slate-900 text-white font-bold text-xs flex items-center justify-center shrink-0 shadow-sm"
              title={`${user?.full_name || 'Investigator'} (${user?.officer_id})`}
            >
              {getInitials(user?.full_name)}
            </div>
            <button
              type="button"
              onClick={handleLogout}
              className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors"
              title="Logout"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        )}

        {!mobile && collapsed && onToggleCollapse && (
          <button
            type="button"
            onClick={onToggleCollapse}
            className="w-full mt-2 py-1 flex items-center justify-center rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 text-xs"
            title="Expand sidebar"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        )}
      </div>
    </aside>
  );
}
