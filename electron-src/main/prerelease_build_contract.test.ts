import * as fs from 'node:fs';
import * as path from 'node:path';

import { describe, expect, it } from 'vitest';

describe('prerelease build contract', () => {
    it('packages overlay-server binaries built from the exact input-server source tree', () => {
        const prereleaseWorkflow = fs.readFileSync(
            path.join(process.cwd(), '.github', 'workflows', 'dev_release_exe.yml'),
            'utf8'
        );
        const overlayServerWorkflow = fs.readFileSync(
            path.join(process.cwd(), '.github', 'workflows', 'build_overlay_server.yml'),
            'utf8'
        );

        expect(prereleaseWorkflow).toContain(
            'git rev-parse HEAD:GSM_Overlay/input_server'
        );
        expect(prereleaseWorkflow).toContain('wait-for-overlay-server');
        expect(prereleaseWorkflow).toContain('overlay-server-source-tree.txt');
        expect(overlayServerWorkflow).toContain(
            'git rev-parse HEAD:GSM_Overlay/input_server'
        );
        expect(overlayServerWorkflow).toContain('overlay-server-source-tree.txt');
    });

    it('builds, bundles, and uploads a native backend wheel for every release platform', () => {
        const workflow = fs.readFileSync(
            path.join(process.cwd(), '.github', 'workflows', 'dev_release_exe.yml'),
            'utf8'
        );

        expect(workflow.match(/Build prerelease backend wheel/g)).toHaveLength(3);
        expect(workflow.match(/write-prerelease-metadata\.mjs/g)).toHaveLength(3);
        expect(workflow.match(/electron-src\/assets\/python\/\*\.whl/g)).toHaveLength(3);
    });

    it('uses an incrementing SemVer prerelease that npm preserves', () => {
        const workflow = fs.readFileSync(
            path.join(process.cwd(), '.github', 'workflows', 'dev_release_exe.yml'),
            'utf8'
        );

        expect(workflow).toContain(
            'compute-version.cjs --pre-release --preid fwiffo-custom'
        );
        expect(workflow).not.toContain('--local --local-id fwiffo.custom');
    });

    it('builds and bundles the checked-out backend for every stable release platform', () => {
        const workflow = fs.readFileSync(
            path.join(process.cwd(), '.github', 'workflows', 'release_exe.yml'),
            'utf8'
        );

        expect(workflow.match(/Build release backend wheel/g)).toHaveLength(3);
        expect(workflow.match(/Smoke test release backend wheel/g)).toHaveLength(3);
        expect(workflow.match(/write-prerelease-metadata\.mjs/g)).toHaveLength(3);
        expect(workflow.match(/--out electron-src\/assets\/backend\.json/g)).toHaveLength(3);
        expect(workflow.match(/python -m cibuildwheel --output-dir electron-src\/assets\/python/g)).toHaveLength(3);
    });

    it('builds one app-targeted wheel and skips whole-wheel native repair on Unix', () => {
        const workflow = fs.readFileSync(
            path.join(process.cwd(), '.github', 'workflows', 'dev_release_exe.yml'),
            'utf8'
        );

        expect(workflow).toContain('CIBW_BUILD: cp310-manylinux_x86_64');
        expect(workflow).toContain('CIBW_REPAIR_WHEEL_COMMAND_LINUX: ""');
        expect(workflow).toContain('CIBW_BUILD: cp310-macosx_arm64');
        expect(workflow).toContain('CIBW_REPAIR_WHEEL_COMMAND_MACOS: ""');
        expect(workflow.match(/CIBW_BUILD: cp310-\*/g)).toHaveLength(1);
    });

    it('keeps retired PyPI and per-platform release workflows absent', () => {
        const workflowDirectory = path.join(process.cwd(), '.github', 'workflows');
        const retiredWorkflows = [
            'pypi_dev.yml',
            'pypi_release.yml',
            'release_linux.yml',
            'release_mac.yml',
            'release_mac_test.yml',
            'release_windows.yml',
        ];

        for (const workflow of retiredWorkflows) {
            expect(fs.existsSync(path.join(workflowDirectory, workflow))).toBe(false);
        }
    });

    it('does not install beta backends from mutable branch archives', () => {
        const pythonOps = fs.readFileSync(
            path.join(process.cwd(), 'electron-src', 'main', 'services', 'python_ops.ts'),
            'utf8'
        );

        expect(pythonOps).not.toContain('/archive/refs/heads/');
    });
});
