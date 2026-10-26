'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { pathToFileURL } = require('node:url');
const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({
    viewport: { width: 360, height: 800 },
    deviceScaleFactor: 1
  });
  const pageErrors = [];
  page.on('pageerror', error => pageErrors.push(error.message));

  try {
    const htmlPath = path.resolve('app/src/main/assets/index.html');
    await page.goto(pathToFileURL(htmlPath).href, { waitUntil: 'load' });
    await page.waitForFunction(() => {
      const display = document.querySelector('#mathDisplay');
      return !!display && display.clientWidth > 0;
    });

    const bankCount = await page.evaluate(() => window.eval('MASTER_CHALLENGES.length'));
    assert.ok(Number.isInteger(bankCount) && bankCount > 0, 'The source question bank must be available in the browser');

    let totalOptions = 0;
    const layoutFailures = [];

    // Exercise every production question and every production option through the real HTML/DOM path.
    for (let i = 0; i < bankCount; i++) {
      const expected = await page.evaluate(index => ({
        prompt: window.eval('MASTER_CHALLENGES[' + index + '].prompt'),
        optionCount: window.eval('MASTER_CHALLENGES[' + index + '].options.length')
      }), i);

      await page.evaluate(index => {
        window.eval('activeChallenges = [MASTER_CHALLENGES[' + index + ']]; currentIndex = 0; loadCurrentQuestion();');
      }, i);

      const state = await page.evaluate(() => {
        const display = document.querySelector('#mathDisplay');
        const prompt = document.querySelector('#questionPrompt')?.textContent ?? '';
        const buttons = [...document.querySelectorAll('#optionsGrid button')];
        const renderedText = (display?.textContent ?? '') + ' ' + buttons.map(button => button.textContent ?? '').join(' ');
        return {
          prompt,
          mathText: display?.textContent?.trim() ?? '',
          optionCount: buttons.length,
          emptyOptions: buttons.map((button, index) => ({ index, text: button.textContent?.trim() ?? '' }))
            .filter(item => !item.text),
          invalidToken: /\b(?:undefined|null|NaN)\b/i.test(renderedText),
          mathOverflow: !!display && display.scrollWidth > display.clientWidth + 2,
          optionOverflows: buttons.map((button, index) => ({
            index,
            overflow: button.scrollWidth > button.clientWidth + 2
          })).filter(item => item.overflow),
          exponentStructureErrors: [...(display?.querySelectorAll('.math-exponent') ?? [])].filter(exponent => {
            const power = exponent.closest('.math-power');
            return !power || !power.querySelector('.math-base');
          }).length
        };
      });

      assert.equal(state.prompt, expected.prompt, 'Question ' + (i + 1) + ': the prompt displayed in the DOM differs from the source');
      assert.ok(state.mathText.length > 0, 'Question ' + (i + 1) + ': the math expression rendered empty');
      assert.equal(state.optionCount, expected.optionCount, 'Question ' + (i + 1) + ': rendered option count differs from the source');
      assert.equal(state.emptyOptions.length, 0, 'Question ' + (i + 1) + ': one or more options rendered empty');
      assert.equal(state.invalidToken, false, 'Question ' + (i + 1) + ': undefined/null/NaN appeared in rendered DOM');
      assert.equal(state.exponentStructureErrors, 0, 'Question ' + (i + 1) + ': an exponent has no associated power/base');
      if (state.mathOverflow || state.optionOverflows.length) {
        layoutFailures.push({ question: i + 1, mathOverflow: state.mathOverflow, optionOverflows: state.optionOverflows });
      }
      totalOptions += state.optionCount;
    }
    assert.deepEqual(layoutFailures, [], 'Horizontal overflow detected at the 360px viewport: ' + JSON.stringify(layoutFailures));

    // Critical semantic case: (٩س)^٠ + ٥س^٠. The second exponent must bind to س, not ٥س.
    const criticalCase = {
      level: 1,
      topic: 'اختبار عرض الأس الصفري',
      prompt: 'اختبار داخلي للتحقق من نطاق الأس',
      math: '(٩س)^٠ + ٥س^٠',
      options: ['(جذر(5) + جذر(2))^2', '7 + 2 جذر(10)', 'س = 5/2', 'جذر[3](-64)'],
      correct: 0,
      rule: 'اختبار بنيوي',
      explanation: 'اختبار بنيوي فقط؛ لا يعدّل بنك التمارين.'
    };
    await page.evaluate(testCase => {
      window.__almofeedQaCase = testCase;
      window.eval('activeChallenges = [window.__almofeedQaCase]; currentIndex = 0; loadCurrentQuestion();');
    }, criticalCase);

    const critical = await page.evaluate(() => {
      const display = document.querySelector('#mathDisplay');
      const exponents = [...(display?.querySelectorAll('.math-exponent') ?? [])].map(exponent => {
        const base = exponent.closest('.math-power')?.querySelector('.math-base');
        const rect = exponent.getBoundingClientRect();
        return {
          baseText: (base?.textContent ?? '').replace(/\s/g, ''),
          top: Number.parseFloat(getComputedStyle(exponent).top),
          hasPower: !!exponent.closest('.math-power'),
          hasBase: !!base,
          width: rect.width,
          height: rect.height
        };
      });
      const coefficient = display?.querySelector('.math-coefficient');
      return {
        mathText: display?.textContent?.trim() ?? '',
        exponents,
        coefficientText: (coefficient?.textContent ?? '').replace(/\s/g, ''),
        coefficientFollowedByPower: !!coefficient?.nextElementSibling?.classList.contains('math-power')
      };
    });
    assert.ok(critical.mathText.includes('٩') && critical.mathText.includes('٥'), 'Critical expression did not preserve both coefficients/digits in rendered text');
    assert.equal(critical.exponents.length, 2, 'Critical expression should render exactly two exponents');
    assert.ok(critical.exponents[0].baseText.includes('٩س'), 'First exponent must bind to grouped base (٩س)');
    assert.equal(critical.exponents[1].baseText, 'س', 'Second exponent must bind to س only, not ٥س');
    assert.equal(critical.coefficientText, '٥', 'Coefficient ٥ must remain outside the power');
    assert.equal(critical.coefficientFollowedByPower, true, 'Coefficient must be a separate DOM node immediately before the variable power');
    assert.ok(critical.exponents.every(item => item.hasPower && item.hasBase), 'Every critical exponent must remain associated with a power and base');
    assert.ok(critical.exponents.every(item => Number.isFinite(item.top) && item.top <= -6.5), 'Adjusted exponent offset is not applied as expected (target: approximately 2mm higher)');

    // Capture reproducible visual evidence for the critical case on a narrow Android-sized viewport.
    fs.mkdirSync(path.resolve('artifacts'), { recursive: true });
    await page.screenshot({
      path: path.resolve('artifacts/math-rendering-mobile-360.png'),
      fullPage: true,
      animations: 'disabled'
    });
    fs.writeFileSync(
      path.resolve('artifacts/math-rendering-mobile-360.json'),
      JSON.stringify({
        viewport: { width: 360, height: 800, deviceScaleFactor: 1 },
        questionsRendered: bankCount,
        optionsRendered: totalOptions,
        criticalExpression: criticalCase.math,
        criticalExponentLayout: critical.exponents,
        physicalDeviceTest: 'NOT_TESTED'
      }, null, 2) + '\n',
      'utf8'
    );

    // Exercise answer selection, score, explanation, next/result and restart in Chromium.
    await page.evaluate(() => {
      window.eval('activeChallenges = [MASTER_CHALLENGES[0]]; currentIndex = 0; score = 0; streak = 0; correctCount = 0; loadCurrentQuestion();');
    });
    const correctIndex = await page.evaluate(() => window.eval('activeChallenges[0].activeCorrectIdx'));
    await page.locator('#optionsGrid button').nth(correctIndex).click();
    const afterAnswer = await page.evaluate(() => ({
      explanationVisible: !document.querySelector('#explanationBox').classList.contains('hidden'),
      nextVisible: !document.querySelector('#nextBtn').classList.contains('hidden'),
      score,
      correctCount
    }));
    assert.equal(afterAnswer.explanationVisible, true, 'Answer selection did not reveal the explanation');
    assert.equal(afterAnswer.nextVisible, true, 'Answer selection did not reveal the next-question control');
    assert.ok(afterAnswer.score > 0 && afterAnswer.correctCount === 1, 'Correct answer did not update scoring');

    await page.locator('#nextBtn').click();
    await page.waitForFunction(() => !document.querySelector('#victoryCard').classList.contains('hidden'));
    const resultVisible = await page.evaluate(() => ({
      visible: !document.querySelector('#victoryCard').classList.contains('hidden'),
      scoreText: document.querySelector('#finalScore')?.textContent?.trim() ?? ''
    }));
    assert.equal(resultVisible.visible, true, 'Completing the challenge did not show the results screen');
    assert.ok(resultVisible.scoreText.length > 0, 'The final score is empty');

    await page.locator('#restartBtn').click();
    const restarted = await page.evaluate(() => ({
      arenaVisible: !document.querySelector('#arenaCard').classList.contains('hidden'),
      activeQuestionCount: window.eval('activeChallenges.length')
    }));
    assert.equal(restarted.arenaVisible, true, 'Restart did not return to the quiz arena');
    assert.equal(restarted.activeQuestionCount, bankCount, 'Restart did not restore the full challenge bank');
    assert.deepEqual(pageErrors, [], 'Uncaught browser JavaScript errors: ' + JSON.stringify(pageErrors));

    console.log('PASS: browser DOM/layout audit rendered ' + bankCount + ' questions and ' + totalOptions + ' options at 360x800.');
    console.log('PASS: zero-exponent scope, 2mm-equivalent uplift, answer flow, explanation, result, and restart.');
    console.log('EVIDENCE: artifacts/math-rendering-mobile-360.png and artifacts/math-rendering-mobile-360.json');
  } finally {
    await browser.close();
  }
})().catch(error => {
  console.error(error);
  process.exitCode = 1;
});
