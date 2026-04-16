import * as assert from 'assert';
import * as vscode from 'vscode';

suite('Maestro Extension Tests', () => {

  suite('Activation', () => {
    test('Extension should be present', () => {
      const ext = vscode.extensions.getExtension('sharpdeveye.maestro-workflow');
      assert.ok(ext, 'Extension not found');
    });

    test('Extension should activate without errors', async () => {
      const ext = vscode.extensions.getExtension('sharpdeveye.maestro-workflow');
      assert.ok(ext, 'Extension not found');
      await ext.activate();
      assert.strictEqual(ext.isActive, true);
    });
  });

  suite('Command Registration', () => {
    const EXPECTED_COMMANDS = [
      'maestro.toggleZeroDefect',
      'maestro.openCommandCenter',
      'maestro.initContext',
      'maestro.diagnose',
      'maestro.evaluate',
      'maestro.refine',
      'maestro.streamline',
      'maestro.calibrate',
      'maestro.fortify',
      'maestro.zeroDefect',
      'maestro.amplify',
      'maestro.chain',
      'maestro.compose',
      'maestro.enrich',
      'maestro.guard',
      'maestro.iterate',
      'maestro.accelerate',
      'maestro.turbocharge',
      'maestro.teachMaestro',
      'maestro.onboardAgent',
      'maestro.adaptWorkflow',
      'maestro.specialize',
      'maestro.extractPattern',
      'maestro.temper',
      'maestro.debugChatCommands',
    ];

    test('All expected commands should be registered', async () => {
      const allCommands = await vscode.commands.getCommands(true);

      for (const cmd of EXPECTED_COMMANDS) {
        assert.ok(
          allCommands.includes(cmd),
          `Command "${cmd}" is not registered`
        );
      }
    });

    test('Should have at least 25 maestro commands', async () => {
      const allCommands = await vscode.commands.getCommands(true);
      const maestroCommands = allCommands.filter(c => c.startsWith('maestro.'));
      assert.ok(
        maestroCommands.length >= 25,
        `Expected >= 25 maestro commands, got ${maestroCommands.length}`
      );
    });
  });

  suite('Zero-Defect Toggle', () => {
    test('Toggle command should execute without error', async () => {
      // Execute toggle twice to return to original state
      await vscode.commands.executeCommand('maestro.toggleZeroDefect');
      await vscode.commands.executeCommand('maestro.toggleZeroDefect');
    });
  });

  suite('Command Center', () => {
    test('Open command center should execute without error', async () => {
      await vscode.commands.executeCommand('maestro.openCommandCenter');
    });
  });
});
