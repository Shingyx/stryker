import * as sinon from 'sinon';
import { MutantResult } from '@stryker-mutator/api/report';
import { File, LogLevel } from '@stryker-mutator/api/core';
import { RunResult } from '@stryker-mutator/api/test_runner';
import { TestFramework } from '@stryker-mutator/api/test_framework';
import { factory, testInjector } from '@stryker-mutator/test-helpers';
import Stryker from '../../src/Stryker';
import { Config } from '@stryker-mutator/api/config';
import { expect } from 'chai';
import InputFileResolver from '../../src/input/InputFileResolver';
import * as typedInject from 'typed-inject';
import { MutatorFacade } from '../../src/mutants/MutatorFacade';
import { MutantTestMatcher } from '../../src/mutants/MutantTestMatcher';
import InitialTestExecutor from '../../src/process/InitialTestExecutor';
import { MutationTestExecutor } from '../../src/process/MutationTestExecutor';
import ScoreResultCalculator from '../../src/ScoreResultCalculator';
import { TempFolder } from '../../src/utils/TempFolder';
import { mock, Mock, testFramework, runResult, testableMutant, mutantResult } from '../helpers/producers';
import BroadcastReporter from '../../src/reporters/BroadcastReporter';
import TestableMutant from '../../src/TestableMutant';
import InputFileCollection from '../../src/input/InputFileCollection';
import LogConfigurator from '../../src/logging/LogConfigurator';
import LoggingClientContext from '../../src/logging/LoggingClientContext';
import { commonTokens } from '@stryker-mutator/api/plugin';
import { TranspilerFacade } from '../../src/transpiler/TranspilerFacade';
import * as di from '../../src/di';
import Timer from '../../src/utils/Timer';
import { Logger } from '@stryker-mutator/api/logging';
import { Transpiler } from '@stryker-mutator/api/transpile';
import { MutationTestReportCalculator } from '../../src/reporters/MutationTestReportCalculator';

const LOGGING_CONTEXT: LoggingClientContext = Object.freeze({
  level: LogLevel.Debug,
  port: 4200
});

describe(Stryker.name, () => {
  let sut: Stryker;
  let testFrameworkMock: TestFramework;
  let inputFileResolverMock: Mock<InputFileResolver>;
  let initialTestExecutorMock: Mock<InitialTestExecutor>;
  let mutationTestExecutorMock: Mock<MutationTestExecutor>;
  let mutantTestMatcherMock: Mock<MutantTestMatcher>;
  let mutatorMock: Mock<MutatorFacade>;
  let strykerConfig: Config;
  let reporterMock: Mock<BroadcastReporter>;
  let tempFolderMock: Mock<TempFolder>;
  let scoreResultCalculator: ScoreResultCalculator;
  let mutationTestReportCalculatorMock: Mock<MutationTestReportCalculator>;
  let configureMainProcessStub: sinon.SinonStub;
  let configureLoggingServerStub: sinon.SinonStub;
  let shutdownLoggingStub: sinon.SinonStub;
  let injectorMock: sinon.SinonStubbedInstance<typedInject.Injector>;
  let timerMock: sinon.SinonStubbedInstance<Timer>;
  let logMock: sinon.SinonStubbedInstance<Logger>;
  let transpilerMock: sinon.SinonStubbedInstance<Transpiler>;

  beforeEach(() => {
    strykerConfig = factory.config();
    logMock = factory.logger();
    reporterMock = mock(BroadcastReporter);
    injectorMock = factory.injector();
    mutantTestMatcherMock = mock(MutantTestMatcher);
    mutatorMock = mock(MutatorFacade);
    configureMainProcessStub = sinon.stub(LogConfigurator, 'configureMainProcess');
    configureLoggingServerStub = sinon.stub(LogConfigurator, 'configureLoggingServer');
    shutdownLoggingStub = sinon.stub(LogConfigurator, 'shutdown');
    configureLoggingServerStub.resolves(LOGGING_CONTEXT);
    inputFileResolverMock = mock(InputFileResolver);
    testFrameworkMock = testFramework();
    initialTestExecutorMock = mock(InitialTestExecutor);
    mutationTestExecutorMock = mock(MutationTestExecutor);
    transpilerMock = factory.transpiler();
    timerMock = sinon.createStubInstance(Timer);
    tempFolderMock = mock(TempFolder as any);
    tempFolderMock.clean.resolves();
    mutationTestReportCalculatorMock = mock(MutationTestReportCalculator);
    scoreResultCalculator = new ScoreResultCalculator(testInjector.logger);
    sinon.stub(di, 'buildMainInjector').returns(injectorMock);
    sinon.stub(TempFolder, 'instance').returns(tempFolderMock);
    sinon.stub(scoreResultCalculator, 'determineExitCode').returns(sinon.stub());
    injectorMock.injectClass
      .withArgs(BroadcastReporter).returns(reporterMock)
      .withArgs(InitialTestExecutor).returns(initialTestExecutorMock)
      .withArgs(InputFileResolver).returns(inputFileResolverMock)
      .withArgs(MutatorFacade).returns(mutatorMock)
      .withArgs(MutantTestMatcher).returns(mutantTestMatcherMock)
      .withArgs(MutationTestExecutor).returns(mutationTestExecutorMock)
      .withArgs(MutationTestReportCalculator).returns(mutationTestReportCalculatorMock)
      .withArgs(ScoreResultCalculator).returns(scoreResultCalculator);
    injectorMock.resolve
      .withArgs(commonTokens.options).returns(strykerConfig)
      .withArgs(di.coreTokens.timer).returns(timerMock)
      .withArgs(di.coreTokens.reporter).returns(reporterMock)
      .withArgs(di.coreTokens.testFramework).returns(testFrameworkMock)
      .withArgs(commonTokens.getLogger).returns(() => logMock)
      .withArgs(di.coreTokens.transpiler).returns(transpilerMock);
  });

  describe('when constructed', () => {
    beforeEach(() => {
      strykerConfig.plugins = ['plugin1'];
      sut = new Stryker({});
    });

    it('should configure logging for master', () => {
      expect(configureMainProcessStub).calledTwice;
    });
  });

  describe('runMutationTest()', () => {

    let inputFiles: InputFileCollection;
    let initialTranspiledFiles: File[];
    let initialRunResult: RunResult;
    let transpiledFiles: File[];
    let mutants: TestableMutant[];
    let mutantResults: MutantResult[];

    beforeEach(() => {
      mutants = [
        testableMutant('file1', 'fooMutator'),
        testableMutant('file2', 'barMutator'),
        testableMutant('file3', 'bazMutator')
      ];
      mutantResults = [mutantResult()];
      mutantTestMatcherMock.matchWithMutants.returns(mutants);
      mutatorMock.mutate.returns(mutants);
      mutationTestExecutorMock.run.resolves(mutantResults);
      inputFiles = new InputFileCollection([new File('input.ts', '')], ['input.ts']);
      initialTranspiledFiles = [new File('input.js', '')];
      transpiledFiles = [new File('output.js', '')];
      inputFileResolverMock.resolve.resolves(inputFiles);
      transpilerMock.transpile.resolves(initialTranspiledFiles);
      initialRunResult = runResult();
      initialTestExecutorMock.run.resolves({ runResult: initialRunResult, transpiledFiles });
    });

    describe('sad flow', () => {

      beforeEach(() => {
        sut = new Stryker({});
      });

      it('should reject when logging server rejects', async () => {
        const expectedError = Error('expected error');
        configureLoggingServerStub.rejects(expectedError);
        await expect(sut.runMutationTest()).rejectedWith(expectedError);
      });

      it('should reject when input file globbing results in a rejection', async () => {
        const expectedError = Error('expected error');
        inputFileResolverMock.resolve.rejects(expectedError);
        await expect(sut.runMutationTest()).rejectedWith(expectedError);
      });

      it('should reject when initial test run rejects', async () => {
        const expectedError = Error('expected error');
        initialTestExecutorMock.run.rejects(expectedError);
        await expect(sut.runMutationTest()).rejectedWith(expectedError);
      });

      it('should reject when mutation tester rejects', async () => {
        const expectedError = Error('expected error');
        mutationTestExecutorMock.run.rejects(expectedError);
        await expect(sut.runMutationTest()).rejectedWith(expectedError);
      });

      it('should quit early if no tests were executed in initial test run', async () => {
        while (initialRunResult.tests.pop());
        const actualResults = await sut.runMutationTest();
        expect(mutationTestExecutorMock.run).not.called;
        expect(actualResults).lengthOf(0);
      });

      it('should quit early if no mutants were generated', async () => {
        while (mutants.pop()); // clear all mutants
        await sut.runMutationTest();
        expect(mutationTestExecutorMock.run).not.called;
      });

      it('should log the remark to run again with logLevel trace if no tests were executed in initial test run', async () => {
        while (initialRunResult.tests.pop());
        await sut.runMutationTest();
        expect(logMock.info).to.have.been.calledWith('Trouble figuring out what went wrong? Try `npx stryker run --fileLogLevel trace --logLevel debug` to get some more info.');
      });

      it('should log the remark to run again with logLevel trace if no mutants were generated', async () => {
        while (mutants.pop()); // clear all mutants
        await sut.runMutationTest();
        expect(logMock.info).to.have.been.calledWith('Trouble figuring out what went wrong? Try `npx stryker run --fileLogLevel trace --logLevel debug` to get some more info.');
      });
    });

    describe('happy flow', () => {

      it('should configure the logging server', async () => {
        sut = new Stryker({});
        await sut.runMutationTest();
        expect(configureLoggingServerStub).calledWith(strykerConfig.logLevel, strykerConfig.fileLogLevel);
      });

      it('should report mutant score', async () => {
        sut = new Stryker({});
        await sut.runMutationTest();
        expect(reporterMock.onScoreCalculated).called;
      });

      it('should determine the exit code', async () => {
        sut = new Stryker({});
        await sut.runMutationTest();
        expect(scoreResultCalculator.determineExitCode).called;
      });

      it('should report mutation test report ready', async () => {
        sut = new Stryker({});
        await sut.runMutationTest();
        expect(mutationTestReportCalculatorMock.report).called;
      });

      it('should create the InputFileResolver', async () => {
        sut = new Stryker({});
        await sut.runMutationTest();
        expect(inputFileResolverMock.resolve).called;
      });

      it('should create the InitialTestExecutor', async () => {
        sut = new Stryker({});
        await sut.runMutationTest();
        expect(injectorMock.injectClass).calledWith(InitialTestExecutor);
        expect(initialTestExecutorMock.run).called;
      });

      it('should create the mutator', async () => {
        sut = new Stryker({});
        await sut.runMutationTest();
        expect(mutatorMock.mutate).calledWith(inputFiles.filesToMutate);
      });

      it('should transpile all files once before starting the mutation testing process', async () => {
        sut = new Stryker({});
        await sut.runMutationTest();
        expect(transpilerMock.transpile).calledWith(inputFiles.files);
        expect(injectorMock.provideValue).calledWith(di.coreTokens.transpiledFiles, initialTranspiledFiles);
      });

      it('should create the mutation test executor', async () => {
        sut = new Stryker({});
        await sut.runMutationTest();
        expect(mutationTestExecutorMock.run).calledWith(mutants);
      });

      it('should clean the stryker temp folder', async () => {
        sut = new Stryker({});
        await sut.runMutationTest();
        expect(tempFolderMock.clean).called;
      });

      it('should let the reporters wrapUp any async tasks', async () => {
        sut = new Stryker({});
        await sut.runMutationTest();
        expect(reporterMock.wrapUp).to.have.been.called;
      });

      it('should shutdown the log4js server', async () => {
        sut = new Stryker({});
        await sut.runMutationTest();
        expect(shutdownLoggingStub).called;
      });

      it('should create the transpiler with produceSourceMaps = true when coverage analysis is enabled', async () => {
        strykerConfig.coverageAnalysis = 'all';
        sut = new Stryker({});
        await sut.runMutationTest();
        expect(injectorMock.provideValue).calledWith(commonTokens.produceSourceMaps, true);
        expect(injectorMock.provideClass).calledWith(di.coreTokens.transpiler, TranspilerFacade);
      });

      it('should create the transpiler with produceSourceMaps = false when coverage analysis is "off"', async () => {
        strykerConfig.coverageAnalysis = 'off';
        sut = new Stryker({});
        await sut.runMutationTest();
        expect(injectorMock.provideValue).calledWith(commonTokens.produceSourceMaps, false);
        expect(injectorMock.provideClass).calledWith(di.coreTokens.transpiler, TranspilerFacade);
      });
    });
  });
});
