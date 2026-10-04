# C949 Python Practice

Starter files for the seven lessons in the *Python Practice* tab of your WGU C949 study guide. Requires Python 3.10+.

Suggested order: 7 (pseudocode tracing), 1, 2, 5, then 3 and 4. Lesson 6 (graph algorithms) is optional; it's mostly beyond this exam.

## Layout

```
lesson1.py … lesson7.py   your work: lesson code + empty exercise stubs + checks
                          (lesson7.py is answers-only: trace the pseudocode on paper, type the result)
tests/                    pytest suite (runs the same checks)
solutions/                finished versions of every lesson file. Peek only after trying
_checker.py, conftest.py  plumbing, no need to edit
```

## Workflow

1. Open `lessonN.py`. The lesson code at the top is complete; read it and run it with `python lessonN.py --demo`.
2. Each exercise is a function that raises `NotImplementedError`, or a variable set to `None` (the paper-trace exercises). Replace it with your answer.
3. Check your progress:

```
python lesson2.py
  ✓  2.1 trace stack and queue
  ✗  2.2 reverse  tail not updated
  ·  2.3 is_balanced  (not started)
```

## With pytest

```
pip install pytest
pytest                        # every lesson; unstarted exercises show as skipped
pytest tests/test_lesson4.py  # one lesson
pytest -k reverse             # one exercise by name
pytest --solutions            # run the suite against the answer key
```

Exercises 5.7 and 6.6's memory question are discussion-only; their answers are in the guide's Solutions section.
