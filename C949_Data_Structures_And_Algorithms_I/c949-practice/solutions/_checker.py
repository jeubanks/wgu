"""Tiny runner used by `python lessonN.py`. pytest users can ignore this."""
import sys


def run(checks, demo=None):
    if demo and '--demo' in sys.argv:
        demo()
        print()
    passed = 0
    for check in checks:
        label = check.__doc__ or check.__name__
        try:
            check()
        except NotImplementedError:
            print(f'  ·  {label}  (not started)')
        except AssertionError as e:
            print(f'  ✗  {label}  {e or "assert failed"}')
        except Exception as e:  # noqa: BLE001 - show any bug, keep going
            print(f'  ✗  {label}  {type(e).__name__}: {e}')
        else:
            print(f'  ✓  {label}')
            passed += 1
    print(f'\n{passed}/{len(checks)} passing')


def need(answer):
    """Trace answers start as None; treat that as 'not started'."""
    if answer is None:
        raise NotImplementedError
    return answer


def big_o(answer):
    """Normalize a Big-O string so 'O(n²)', 'o(n^2)' and 'O( n ^ 2 )' match."""
    if answer is None:
        raise NotImplementedError
    s = answer.lower().replace(' ', '').replace('²', '^2')
    for ch in '*·×':
        s = s.replace(ch, '')
    return s
